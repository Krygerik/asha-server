import {Request, Response} from "express";
import {filter, find, flatten, isNil, map, omit, uniq} from "lodash";
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
    EDictionaryName,
    IDictionary,
    IRecords,
} from "../modules/dictionaries";
import {TournamentService} from "../modules/tournament";

export class GameController {
    private authService: AuthService = new AuthService();
    private dictionaryService: DictionariesService = new DictionariesService();
    private gameService: GameService = new GameService();
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
            // @ts-ignore
            const savedGame: ISavedGame | null = await this.gameService.findGame({
                combat_id: req.body.combat_id
            })

            /**
             * Если запись игры еще не создана - создаем
             */
            if (!savedGame) {
                const gameData: IInputGameData = {
                    ...omit(req.body, ['userId', 'roles']),
                    players_ids: [req.body.userId],
                };

                const createdGame = await this.gameService.createGame(gameData);

                return successResponse('Запись игры успешно создана', createdGame, res);
            }

            /**
             * Если игрок уже записан в игре - выкидываем
             */
            if (savedGame.players_ids.includes(req.body.userId)) {
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

            const updatedGame = await this.gameService.updateGame(savedGame._id, updatedValue, option);

            successResponse('Запись игры успешно обновлена', updatedGame, res);
        } catch (error) {
            internalError(error, res);
        }
    }

    /**
     * Запись результатов игры в турнир
     */
    private async saveGameIntoTournament(gameId: string) {
        // @ts-ignore
        const savedGame: ISavedGame | null = await this.gameService.findGame({ _id: gameId });

        if (!savedGame) {
            return null;
        }

        if (savedGame.waiting_for_disconnect_status || savedGame.disconnect) {
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

        const changedRating: Record<string, { changedRating: number; newRating: number }> = await this.authService.changePlayerRating(
            winnerPlayer.user_id,
            looserPlayer.user_id,
        );

        const updatedValue = {
            $set: {
                "players.$[winner].changed_rating": changedRating[winnerPlayer.user_id].changedRating,
                "players.$[winner].new_rating": changedRating[winnerPlayer.user_id].newRating,
                "players.$[looser].changed_rating": changedRating[looserPlayer.user_id].changedRating,
                "players.$[looser].new_rating": changedRating[looserPlayer.user_id].newRating,
            }
        };

        const option = {
            arrayFilters: [
                { "winner.user_id": winnerPlayer.user_id },
                { "looser.user_id": looserPlayer.user_id },
            ]
        };

        await this.gameService.updateGame(savedGame._id, updatedValue, option);
    }

    /**
     * Сохранение победителя и определение красного игрока
     */
    public async saveGameWinner(req: Request<unknown, unknown, IWinnerRequestDto & { userId: string; roles: ERoles }>, res: Response) {
        try {
            // @ts-ignore
            const savedGame: ISavedGame = await this.gameService.findGame({ combat_id: req.body.combat_id });

            /**
             * Если игра с данным id отсутствует или игра завершилась корректно - не меняем ее исход
             */
            if (isNil(savedGame)) {
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
                    disconnect: false,
                    percentage_of_army_left: req.body.percentage_of_army_left,
                    waiting_for_disconnect_status: Boolean(req.body.wasDisconnect),
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

            const updatedGame = await this.gameService.updateGame(savedGame._id, updatedValue, option);

            const tournamentData = await this.tournamentService.getTournamentIdWithNumberOfRound(savedGame.players_ids);

            /**
             * Если нашелся турнир с активным раундом - сохраняем это в запись игры
             */
            if (tournamentData) {
                const updateQuery = {
                    $set: tournamentData
                }

                await this.gameService.updateGame(savedGame._id, updateQuery);

                await this.saveGameIntoTournament(savedGame._id);
            }

            successResponse('Финальные данные игры успешно записаны', updatedGame, res);

        } catch (error) {
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
    public async getShortGameInfoList(req: Request<unknown, unknown, { filter: IShortFilter }, Partial<IFindGameOptions>>, res: Response) {
        try {
            const { query } = req;
            const { filter } = req.body;

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
            const totalPages = await this.gameService.getCountPagesByPageSize(options.items, filter);

            /**
             * Список игр без никнеймов игроков
             */
            const allShortGameInfoList: IShortGame[] = await this.gameService.getShortGameInfoList(options, filter);

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
            const { combat_id, disconnect } = req.body;

            if (combat_id === undefined || disconnect === undefined) {
                return insufficientParameters(res);
            }

            await this.gameService.setGameDisconnectStatus(combat_id, disconnect);

            const gameDoc = await this.gameService.findGame({ combat_id });

            await this.saveGameIntoTournament(gameDoc._id);

            return successResponse(
                `Игре с combat_id: ${combat_id} проставлен статус разрыва соединения в ${disconnect}`,
                null,
                res,
            );
        } catch (error) {
            return mongoError(error, res);
        }
    }

    /**
     * Получение винрейта по расам
     */
    public async getRacesWinRate(req: Request<unknown, unknown, { filter: IFilterGames }, unknown>, res: Response) {
        try {
            const { filter } = req.body;

            const racesDictionaryDoc = await this.dictionaryService.getDictionary(EDictionaryName.Races)

            // @ts-ignore
            const racesDictionary: IDictionary = racesDictionaryDoc.toObject();

            /**
             * Одноуровневый список всех возможных матчапов
             */
            const allMatchUpsList = flatten(
                racesDictionary.records.map((firstRecord: IRecords) => (
                    racesDictionary.records.map((secondRecord: IRecords) => ({
                        mainRaceId: firstRecord.game_id,
                        otherRaceId: secondRecord.game_id,
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