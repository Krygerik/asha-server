import {Request, Response} from "express";
import {filter, find, flatten, isNil, isNull, map, omit, uniq} from "lodash";
import {
    EPlayerColor,
    GameService,
    IFilterGames,
    IFindGameOptions,
    IInputGameData,
    ISavedGame,
    ISavedPlayer,
    ISaveGameParamsBody,
    ISetDisconnectStatusDto,
    IShortFilter,
    IShortGame,
    IShortPlayer,
    IWinnerRequestDto,
} from "../modules/game";
import {
    failureResponse,
    incorrectParameters,
    insufficientParameters,
    internalError,
    mongoError,
    successResponse,
} from "../modules/common/services";
import {AuthService, ERoles} from "../modules/auth";
import {
    DictionariesService,
    EDictionariesNames,
    IRecords,
} from "../modules/dictionaries";
import {TournamentService} from "../modules/tournament";
import {LadderService, ILadderRecord} from "../modules/ladder";
import {logger} from "../utils";

export class GameController {
    private authService: AuthService = new AuthService();
    private dictionaryService: DictionariesService = new DictionariesService();
    private gameService: GameService = new GameService();
    private ladderService: LadderService = new LadderService();
    private tournamentService: TournamentService = new TournamentService();

    /**
     * Получение таблицы соотношений ид игроков к никам
     */
    private getMappingIdToNicknames(idList: string[]) {
        const filteredEmptyIdList = filter<string>(idList, Boolean);

        return this.authService.getRelatedMappingUserIdToUserNickname(filteredEmptyIdList);
    }

    /**
     * Обогащение информации об играх никнеймами игроков
     */
    private async addNicknamesToGameInfoList(gameList: IShortGame[]): Promise<any[]> {
        const relatedUserIdList = [];

        gameList.forEach(item => item.players.forEach(player => {
            relatedUserIdList.push(player.user_id);
        }));

        const mappingIdToNicknames = await this.getMappingIdToNicknames(uniq(relatedUserIdList));

        return map(gameList, (item: ISavedGame | IShortGame) => ({
            ...item,
            players: map(item.players, ((player: ISavedPlayer | IShortPlayer) => ({
                ...player,
                nickname: mappingIdToNicknames[player.user_id]
            })))
        }));
    }

    /**
     * Обогащение одной записи игры никами участников
     */
    private async addNicknameToSingleGame(gameInfo: ISavedGame) {
        const mappingIdToNicknames = await this.getMappingIdToNicknames(gameInfo.players_ids);

        return {
            ...gameInfo,
            players: map(gameInfo.players, ((player: ISavedPlayer) => ({
                ...player,
                nickname: mappingIdToNicknames[player.user_id]
            })))
        }
    }

    /**
     * Сохранение основных характеристик игрока с его никнеймом
     * Ожидаем от обоих игроков по такому запросу для заполнения основных данных об игре
     */
    public async saveGameParams(
        req: Request<unknown, unknown, ISaveGameParamsBody & { userId: string; roles: ERoles }>, res: Response
    ) {
        try {
            logger.info(
                'saveGameParams: Запрос на сохранение основных данных об игре',
                { metadata: { reqBody: req.body }}
            );

            const savedGameDoc = await this.gameService.findGame({
                combat_id: req.body.combat_id
            })

            /**
             * Если запись игры еще не создана - создаем
             */
            if (!savedGameDoc) {
                const gameData: IInputGameData = {
                    ...omit(req.body, ['userId', 'roles']),
                    players_ids: [req.body.userId],
                };

                logger.info(
                    'saveGameParams: Создание новой игры на основе пришедших данных',
                    { metadata: { gameData }}
                );

                const createdGame = await this.gameService.createGame(gameData);

                logger.info(
                    'saveGameParams: Игра успешно создана',
                    { metadata: { createdGame: createdGame.toObject() }}
                );

                return successResponse('Запись игры успешно создана', createdGame, res);
            }

            // @ts-ignore
            const savedGame: ISavedGame | null = savedGameDoc.toObject();

            /**
             * Если игрок уже записан в игре - выкидываем
             */
            if (savedGame.players_ids.includes(req.body.userId)) {
                logger.warn(
                    'saveGameParams: Игрок уже записан в запись игры',
                    { metadata: { savedGame }}
                );

                return successResponse('Игрок уже записан в запись игры', savedGame, res);
            }

            const updatedValue = {
                $push: {
                    players_ids: req.body.userId,
                },
                $set: {
                    "players.$[player].user_id": req.body.userId,
                }
            };

            const option = {
                arrayFilters: [
                    { "player.user_id": null },
                ]
            };

            logger.info(
                'saveGameParams: Обновление записи игры в бд',
                {
                    metadata: {
                        _id: savedGame._id,
                        updatedValue,
                    }
                }
            );

            const updatedGame = await this.gameService.updateGame(savedGame._id, updatedValue, option);

            successResponse('Запись игры успешно обновлена', updatedGame, res);
        } catch (error) {
            logger.error(
                'saveGameParams: Ошибка при обработке запроса',
                { metadata: { error: error }}
            );

            internalError(error, res);
        }
    }

    /**
     * Сохранение изменений рейтинга в запись игры
     */
    private async saveChangePlayersRatingToGame(winnerId: string, looserId: string, gameId: string) {
        const changedRating: Record<
            string,
            { changedRating: number; newRating: number }
        > = await this.authService.changePlayerRating(
            winnerId,
            looserId,
        );

        const updatedValue = {
            $set: {
                "players.$[winner].changed_rating": changedRating[winnerId].changedRating,
                "players.$[winner].new_rating": changedRating[winnerId].newRating,
                "players.$[looser].changed_rating": changedRating[looserId].changedRating,
                "players.$[looser].new_rating": changedRating[looserId].newRating,
            }
        };

        const option = {
            arrayFilters: [
                { "winner.user_id": winnerId },
                { "looser.user_id": looserId },
            ]
        };

        logger.info(
            'saveGameIntoTournament: Сохранение изменения рейтинга игроков в запись игры',
            {
                metadata: {
                    gameId: gameId,
                    updatedValue,
                }
            }
        );

        await this.gameService.updateGame(gameId, updatedValue, option);
    }

    /**
     * Запись результатов игры в турнир
     */
    private async saveGameIntoTournament(gameId: string) {
        logger.info(
            'saveGameIntoTournament: Запись результатов игры в турнир',
            { metadata: { gameId }}
        );

        // @ts-ignore
        const savedGame: ISavedGame | null = await this.gameService.findGame({ _id: gameId });

        if (!savedGame) {
            logger.warn(
                'saveGameIntoTournament: Запись игры не найдена',
                { metadata: { gameId }}
            );

            return null;
        }

        if (!savedGame.tournament_id) {
            logger.warn(
                'saveGameIntoTournament: Не найден ИД турнира, в рамках которого сыграна игра',
                { metadata: { tournament_id: savedGame.tournament_id }}
            );

            return null;
        }

        if (savedGame.waiting_for_disconnect_status || savedGame.disconnect) {
            logger.warn(
                'saveGameIntoTournament: Игра находится в статуса ожидания или разрыва соединения',
                { metadata: {
                    disconnect: savedGame.disconnect,
                    waiting_for_disconnect_status: savedGame.waiting_for_disconnect_status,
                }}
            );

            return null;
        }

        const winnerPlayer = savedGame.players.find((player: ISavedPlayer) => player.winner);
        const looserPlayer = savedGame.players.find((player: ISavedPlayer) => !player.winner);

        await this.tournamentService.addGameToTournament(
            savedGame.tournament_id,
            savedGame.number_of_round,
            winnerPlayer.user_id,
            savedGame._id,
        );

        await this.saveChangePlayersRatingToGame(winnerPlayer.user_id, looserPlayer.user_id, savedGame._id);
    }

    /**
     * Запись ладдерных данных в запись игры
     */
    private async setLadderDataInToGame(winnerId: string, looserId: string, gameId: string) {
        /**
         * Ладдерной игрой считается игра обоих зарегистрированных игроков
         */
        if (!winnerId || !looserId) {
            return;
        }

        // @ts-ignore
        const activeWinnerLadder: ILadderRecord | null = await this.ladderService.getActiveLadderByUserId(winnerId);

        if (activeWinnerLadder && activeWinnerLadder.member_ids.includes(looserId)) {
            /**
             * Добавляем игру в список игр ладдерной встречи
             */
            if (!activeWinnerLadder.game_ids.includes(gameId)) {
                await this.ladderService.addGameToLadder(activeWinnerLadder._id, gameId);
            }

            await this.saveChangePlayersRatingToGame(winnerId, looserId, gameId);

            await this.gameService.updateGame(gameId, { $set: { ladder_id: activeWinnerLadder._id }});
        } else {
            /**
             * Если нет активного раунда обоих игроков, закрываем все открытые их встречи
             */

            if (activeWinnerLadder) {
                await this.ladderService.closeLadderRound(activeWinnerLadder._id);
            }

            // @ts-ignore
            const activeLooserLadder: ILadderRecord | null = await this.ladderService.getActiveLadderByUserId(looserId);

            if (activeLooserLadder) {
                await this.ladderService.closeLadderRound(activeLooserLadder._id);
            }
        }
    }

    /**
     * Сохранение победителя и определение красного игрока
     */
    public async saveGameWinner(req: Request<unknown, unknown, IWinnerRequestDto & { userId: string; roles: ERoles }>, res: Response) {
        try {
            logger.info(
                'saveGameWinner: Запрос на сохранение победителя и определение красного игрока',
                { metadata: { reqBody: req.body }}
            );

            // @ts-ignore
            const savedGame: ISavedGame = await this.gameService.findGame({ combat_id: req.body.combat_id });

            /**
             * Если игра с данным id отсутствует выкидываем
             */
            if (isNil(savedGame)) {
                logger.warn(
                    'saveGameWinner: Игра с таким ID отсутствует',
                    { metadata: { combat_id: req.body.combat_id }}
                );

                return failureResponse('Игра с таким ID отсутствует', null, res);
            }

            const senderIsWinner = (
                req.body.isRedPlayer && req.body.winner === EPlayerColor.RED
                || !req.body.isRedPlayer && req.body.winner === EPlayerColor.BLUE
            )

            const winnerId = senderIsWinner
                ? req.body.userId
                : find(
                    savedGame.players_ids,
                    (playerId: string) => playerId !== req.body.userId
                );

            const looserId = find(
                savedGame.players_ids,
                (playerId: string) => playerId !== winnerId
            );

            const updatedValue = {
                $set: {
                    "players.$[redPlayer].user_id": req.body.winner === EPlayerColor.RED ? winnerId : looserId,
                    "players.$[bluePlayer].user_id": req.body.winner === EPlayerColor.BLUE ? winnerId : looserId,
                    "players.$[winner].army_remainder": req.body.army_remainder,
                    "players.$[looser].army_remainder": [],
                    "players.$[winner].winner": true,
                    "players.$[looser].winner": false,
                    date: req.body.date,
                    percentage_of_army_left: req.body.percentage_of_army_left,
                    // Если простановка статуса разрыва соединения прилетело раньше, не ждем новый
                    waiting_for_disconnect_status: isNull(savedGame.waiting_for_disconnect_status)
                        ? req.body.wasDisconnect
                        : savedGame.waiting_for_disconnect_status,
                    winner: req.body.winner,
                }
            };

            const option = {
                multi: true,
                arrayFilters: [
                    { "redPlayer.color": EPlayerColor.RED },
                    { "bluePlayer.color": EPlayerColor.BLUE },
                    { "winner.color": req.body.winner },
                    { "looser.color": { $ne: req.body.winner} },
                ]
            };

            logger.info(
                'saveGameWinner: Запись победителя игры в бд',
                {
                    metadata: {
                        _id: savedGame._id,
                        updatedValue,
                    }
                }
            );

            await this.gameService.updateGame(savedGame._id, updatedValue, option);

            await this.setLadderDataInToGame(winnerId, looserId, savedGame._id);

            const tournamentData = await this.tournamentService.getTournamentIdWithNumberOfRound(savedGame.players_ids);

            /**
             * Если нашелся турнир с активным раундом - сохраняем это в запись игры
             */
            if (tournamentData) {
                logger.info(
                    'saveGameWinner: Сохранение ИД турнира и номера раунда этой игры',
                    { metadata: { tournamentData }}
                );

                const updateQuery = {
                    $set: tournamentData
                }

                await this.gameService.updateGame(savedGame._id, updateQuery);

                await this.saveGameIntoTournament(savedGame._id);
            }

            successResponse('Финальные данные игры успешно записаны', { id: savedGame._id }, res);

        } catch (error) {
            logger.error(
                'saveGameWinner: Ошибка при сохранении победителя игры и записи результата в турнир',
                { metadata: { error }}
            );

            internalError(error, res);
        }
    }

    public async getGame(req: Request, res: Response) {
        try {
            if (!req.params.id) {
                return insufficientParameters(res);
            }

            const gameFilter = { _id: req.params.id };
            const docGameData = await this.gameService.findGame(gameFilter);

            // @ts-ignore
            const gameData: ISavedGame = docGameData.toObject();

            const gameDataWithNicknameList = await this.addNicknameToSingleGame(gameData);

            successResponse('get game successfull', gameDataWithNicknameList, res);
        } catch (error) {
            internalError(error, res);
        }
    }

    /**
     * Получение краткого списка всех игр
     */
    public async getShortGameInfoList(req: Request<unknown, unknown, IShortFilter, Partial<IFindGameOptions>>, res: Response) {
        try {
            const { query } = req;

            if (!query.items || !query.requestPage) {
                return incorrectParameters(res);
            }

            const options = {
                items: Number(query.items),
                requestPage: Number(query.requestPage),
            }

            /**
             * Количество страниц пагинации
             */
            const totalPages = await this.gameService.getCountPagesByPageSize(options.items, req.body);

            /**
             * Список игр без никнеймов игроков
             */
            const allShortGameInfoList: IShortGame[] = await this.gameService.getShortGameInfoList(options, req.body);

            const gameDataWithNicknameList = await this.addNicknamesToGameInfoList(allShortGameInfoList);

            return successResponse(
                'Список краткой информации по всем играм получен успешно',
                {
                    pagination: {
                        activePage: options.requestPage,
                        totalPages,
                    },
                    shortGameInfoList: gameDataWithNicknameList,
                },
                res,
            )
        } catch (error) {
            internalError(error, res);
        }
    }

    /**
     * Получение списка игр с краткой информацией по нику игрока
     */
    public async getShortGameInfoListByUserId(req: Request, res: Response) {
        try {
            const userId = req.query.userId;

            if (typeof userId !== 'string') {
                return insufficientParameters(res);
            }

            let shortGameInfoList: IShortGame[] = await this.gameService.getShortGamesInfoListByUserId(userId);

            const gameDataWithNicknameList = await this.addNicknamesToGameInfoList(shortGameInfoList);

            return successResponse(
                'Список игр c краткой информацией получен успешно',
                gameDataWithNicknameList,
                res,
            );
        } catch (error) {
            internalError(error, res);
        }
    }

    /**
     * Получение списка игр с краткой информацией текущего пользователя
     */
    public async getShortGameInfoByUserId(req: Request, res: Response) {
        try {
            const { userId } = req.body.userId;
            const limit = req.query.limit;

            if (limit && typeof limit !== 'string') {
                return insufficientParameters(res);
            }

            const additionalOptions = {
                ...limit ? { limit }: {}
            };

            const shortGameInfoList = await this.gameService.getShortGamesInfoByUser(userId, additionalOptions);

            return successResponse(
                'Список краткой информации по последним играм пользователя получен',
                shortGameInfoList,
                res,
            );
        } catch (error) {
            internalError(error, res);
        }
    }

    /**
     * Проставление игре статуса разрыва соединения
     */
    public async setGameDisconnectStatusByCombatId(
        req: Request<unknown, unknown, ISetDisconnectStatusDto & { userId: string; roles: string[] }>, res: Response
    ) {
        try {
            logger.info(
                'setGameDisconnectStatusByCombatId: Проставление игре статуса разрыва соединения',
                { metadata: { reqBody: req.body }}
            );

            const { combat_id, IsDisconnect } = req.body;

            if (combat_id === undefined) {
                logger.warn(
                    'setGameDisconnectStatusByCombatId: В запросе отсутствует combat_id',
                    { metadata: { combat_id }}
                );

                return insufficientParameters(res);
            }

            await this.gameService.setGameDisconnectStatus(combat_id, Boolean(IsDisconnect));

            const gameDoc = await this.gameService.findGame({ combat_id });

            if (!gameDoc) {
                logger.warn(
                    'setGameDisconnectStatusByCombatId: Не удалось найти игру с таким CombatId',
                    { metadata: { combat_id }}
                );

                return failureResponse('Не удалось найти игру с таким CombatId', null, res);
            }

            await this.saveGameIntoTournament(gameDoc._id);

            return successResponse(
                `Игре с combat_id: ${combat_id} проставлен статус разрыва соединения в ${Boolean(IsDisconnect)}`,
                null,
                res,
            );
        } catch (error) {
            logger.error(
                'setGameDisconnectStatusByCombatId: Ошибка при попытке проставить игре статуса разрыва соединения',
                { metadata: { error }}
            );

            return internalError(error.toString(), res);
        }
    }

    /**
     * Получение винрейта по расам
     */
    public async getRacesWinRate(req: Request<unknown, unknown, { filter: IFilterGames }, unknown>, res: Response) {
        try {
            const { filter } = req.body;

            // @ts-ignore
            const racesDictionary: IRecords[] = await this.dictionaryService.getDictionary(EDictionariesNames.Races)

            /**
             * Одноуровневый список всех возможных матчапов
             */
            const allMatchUpsList = flatten(
                racesDictionary.map((firstRecord: IRecords) => (
                    racesDictionary.map((secondRecord: IRecords) => ({
                        mainRaceId: firstRecord.game_id[0],
                        otherRaceId: secondRecord.game_id[0],
                    }))
                ))
            );

            /**
             * Одноуровневый список винрейтов всех возможных матчапов
             */
            const allMatchUpsWinRateList = await Promise.all(
                allMatchUpsList.map(
                    (matchUp) => this.gameService.getSingleMatchUpWinRate(filter, matchUp.mainRaceId, matchUp.otherRaceId)
                )
            );

            /**
             * Итоговая мапа винрейтов всех МА
             */
            const resultMapRaceIdsToWinRates = allMatchUpsList.reduce(
                (accumulator, current, index) => ({
                    ...accumulator,
                    [current.mainRaceId]: {
                        ...accumulator[current.mainRaceId],
                        [current.otherRaceId]: allMatchUpsWinRateList[index],
                    }

                }),
                {}
            );

            return successResponse(
                'Статистика по расам получена успешно',
                resultMapRaceIdsToWinRates,
                res,
            );
        } catch (error) {
            return mongoError(error, res);
        }
    }
}