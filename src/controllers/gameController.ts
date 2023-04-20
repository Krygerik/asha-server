import {Request, Response} from "express";
import {filter, find, flatten, isNil, map, omit, uniq} from "lodash";
import { AccountService } from "../modules/account";
import {
    EPlayerColor,
    GameService,
    IFilterGames,
    IFindGameOptions,
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
    successResponseWithoutMessage,
} from "../modules/common/services";
import {ERoles} from "../modules/auth";
import {
    DictionariesService,
    EDictionariesNames,
    IRecords,
} from "../modules/dictionaries";
import {TournamentService} from "../modules/tournament";
import {LadderService, ILadderRecord} from "../modules/ladder";
import {logger} from "../utils";
import { ITournamentIdWithNumberOfRound } from "../modules/tournament/tournament-model";

export class GameController {
    private accountService: AccountService = new AccountService();
    private dictionaryService: DictionariesService = new DictionariesService();
    private gameService: GameService = new GameService();
    private ladderService: LadderService = new LadderService();
    private tournamentService: TournamentService = new TournamentService();

    /**
     * Получение таблицы соотношений ид игроков к никам
     */
    private getMappingIdToNicknames(idList: string[]) {
        const filteredEmptyIdList = filter<string>(idList, Boolean);

        return this.accountService.getUserNicknameListByUserIdList(filteredEmptyIdList);
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

            /*
             * Заменяем ИД существ
             */
            const allChangedDictionaries = await this.dictionaryService.getAllChangedDictionaries( req.body.map_type, req.body.map_version);
            
            const bodyWithOrigID = {
                ...omit(req.body, ['players']),
                players: req.body.players.map(element => ({
                        ...omit(element, ["army_remainder", "army", "arts", "perks", "skills", "spells", "war_machines", "hero"]),
                        army: element.army.map(function(el) {
                            let result = allChangedDictionaries[EDictionariesNames.Creatures].find(item => item.change_id.includes(el.name))
                            return {
                                name: result?._id?.game_id || el.name,
                                count: el.count
                            }
                        }),
                        arts: element.arts.map(el => allChangedDictionaries[EDictionariesNames.Artifacts].find(item => item.change_id.includes(el))?._id?.game_id || el),
                        perks: element.perks.map(el => allChangedDictionaries[EDictionariesNames.Perks].find(item => item.change_id.includes(el))?._id?.game_id || el),
                        skills: element.skills.map(el => allChangedDictionaries[EDictionariesNames.Skills].find(item => item.change_id.includes(el))?._id?.game_id || el),
                        spells: element.spells.map(el => allChangedDictionaries[EDictionariesNames.Spells].find(item => item.change_id.includes(el))?._id?.game_id || el),
                        war_machines: element.war_machines.map(el => allChangedDictionaries[EDictionariesNames.WarMachines].find(item => item.change_id.includes(el))?._id?.game_id || el),
                        hero: allChangedDictionaries[EDictionariesNames.Heroes].find(item => item.change_id.includes(element.hero))?._id?.game_id || element.hero
                    })
                )
            }

            const game: ISavedGame | null = await this.gameService.findGame({
                combat_id: bodyWithOrigID.combat_id
            })

            /**
             * Если запись игры еще не создана - создаем
             */
            if (!game) {
                const gameData = {
                    ...omit(bodyWithOrigID, ['userId', 'roles']),
                    players_ids: [bodyWithOrigID.userId],
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

            /**
             * Если игрок уже записан в игре - выкидываем
             */
            if (game.players_ids.includes(bodyWithOrigID.userId)) {
                logger.warn(
                    'saveGameParams: Игрок уже записан в запись игры',
                    { metadata: { game }}
                );

                return successResponse('Игрок уже записан в запись игры', game, res);
            }

            const updatedValue = {
                $push: {
                    players_ids: bodyWithOrigID.userId,
                },
            };

            logger.info(
                'saveGameParams: Обновление записи игры в бд',
                { metadata: { _id: game._id, updatedValue }
                }
            );

            const updatedGame: ISavedGame | null = await this.gameService.findOneAndUpdate(
                { _id: game._id }, updatedValue
            );

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
     * Проверка и обогащение данными ладдера
     */
    private async checkAndEnrichmentLadderData(gameId: string) {
        const game: ISavedGame = await this.gameService.findGame({ _id: gameId });

        const winnerPlayer = game.players.find((player: ISavedPlayer) => player.winner);
        const looserPlayer = game.players.find((player: ISavedPlayer) => !player.winner);

        const currentLadder: ILadderRecord | null = await this.ladderService.getActiveLadderByUserId(winnerPlayer.user_id);

        if (!currentLadder) {
            return null;
        }

        if (currentLadder.member_ids.includes(looserPlayer.user_id)) {
            if (!currentLadder.game_ids.includes(gameId)) {
                await this.ladderService.addGameToLadder(currentLadder._id, gameId);
            }

            const changedRating: Record<
                string, { changedRating: number; newRating: number }
            > = await this.accountService.changePlayerRating(
                winnerPlayer.user_id,
                looserPlayer.user_id,
            );

            const updatedValue = {
                $set: {
                    ladder_id: currentLadder._id,
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

            await this.gameService.updateGame(gameId, updatedValue, option);

            return null;
        }

        /**
         * Если это не ладдерная встреча между игроками - закрываем их текущие ладдерные встречи
         */
        await this.ladderService.closeLadderRound(currentLadder._id);

        const activeLooserLadder: ILadderRecord = await this.ladderService.getActiveLadderByUserId(looserPlayer.user_id);

        if (activeLooserLadder) {
            await this.ladderService.closeLadderRound(activeLooserLadder._id);
        }
    }

    /**
     * Работа с турнирными данными
     */
    private async checkAndEnrichmentTournamentData(gameId: string) {
        try {
            const game: ISavedGame = await this.gameService.findGame({ _id: gameId });

            const tournamentData: ITournamentIdWithNumberOfRound | null
                = await this.tournamentService.getTournamentIdWithNumberOfRound(game.players_ids);

            if (!tournamentData) {
                logger.info(
                    'saveGameWinner: Не удалось найти турнирные данные для игры',
                    { metadata: { gameId }}
                );

                return;
            }

            const winnerPlayer = game.players.find((player: ISavedPlayer) => player.winner);
            const looserPlayer = game.players.find((player: ISavedPlayer) => !player.winner);

            await this.tournamentService.addGameToTournament(
                tournamentData.tournament_id,
                tournamentData.number_of_round,
                winnerPlayer.user_id,
                game._id,
            );

            const changedRating: Record<
                string, { changedRating: number; newRating: number }
            > = await this.accountService.changePlayerRating(
                winnerPlayer.user_id,
                looserPlayer.user_id,
            );

            const updatedValue = {
                $set: {
                    "players.$[winner].changed_rating": changedRating[winnerPlayer.user_id].changedRating,
                    "players.$[winner].new_rating": changedRating[winnerPlayer.user_id].newRating,
                    "players.$[looser].changed_rating": changedRating[looserPlayer.user_id].changedRating,
                    "players.$[looser].new_rating": changedRating[looserPlayer.user_id].newRating,
                    ...tournamentData,
                }
            };

            const option = {
                arrayFilters: [
                    { "winner.user_id": winnerPlayer.user_id },
                    { "looser.user_id": looserPlayer.user_id },
                ]
            };

            logger.info(
                'saveGameWinner: Сохранение турнирных данных в запись игры',
                { metadata: { updatedValue, option }}
            );

            await this.gameService.updateGame(gameId, updatedValue, option);
        } catch (error) {
            logger.error(
                'saveGameWinner: Ошибка при работе с турнирными данными',
                { metadata: { error }}
            );
        }
    }

    /**
     * Запуск сторонних эффектов в завершенной игре
     */
    private async runSideEffectOnCompletedGame(game: ISavedGame) {
        if (
            !game.winner
            || game.waiting_for_disconnect_status
            || game.disconnect
            || game.players_ids.length < 2
        ) {
            return;
        }

        await this.checkAndEnrichmentTournamentData(game._id);

        // await this.checkAndEnrichmentLadderData(game._id);
    }

    /**
     * Сохранение победителя и определение красного игрока
     */
    public async saveGameWinner(req: Request<unknown, unknown, IWinnerRequestDto>, res: Response) {
        try {
            logger.info(
                'saveGameWinner: Запрос на сохранение победителя и определение красного игрока',
                { metadata: { reqBody: req.body }}
            );

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

            if (savedGame.winner && !savedGame.disconnect) {
                return successResponse('Окончательные результаты игры уже записаны', savedGame, res);
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
                    disconnect_confirmed: false,
                    percentage_of_army_left: req.body.percentage_of_army_left,
                    // Если простановка статуса разрыва соединения прилетело раньше, не ждем новый
                    waiting_for_disconnect_status: savedGame.disconnect_confirmed
                        ? false
                        : req.body.wasDisconnect,
                    winner: req.body.winner,
                }
            };

            const option = {
                arrayFilters: [
                    { "redPlayer.color": EPlayerColor.RED },
                    { "bluePlayer.color": EPlayerColor.BLUE },
                    { "winner.color": req.body.winner },
                    { "looser.color": { $ne: req.body.winner} },
                ],
                multi: true,
                new: true,
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

            const updatedGamed: ISavedGame = await this.gameService.findOneAndUpdate(
                { _id: savedGame._id }, updatedValue, option
            );

            await this.runSideEffectOnCompletedGame(updatedGamed);

            successResponse('Финальные данные игры успешно записаны', updatedGamed, res);

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
     * Проставление игре статуса разрыва соединения
     */
    public async setGameDisconnectStatusByCombatId(
        req: Request<unknown, unknown, ISetDisconnectStatusDto>, res: Response
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

            const savedGame: ISavedGame = await this.gameService.findGame({ combat_id });

            const updatedValue = {
                disconnect: Boolean(IsDisconnect),
                waiting_for_disconnect_status: false,
                disconnect_confirmed: !savedGame.waiting_for_disconnect_status
            };

            logger.info(
                'setGameDisconnectStatusByCombatId: Запись статуса разрыва соединения в запись игры',
                { metadata: { combat_id, updatedValue }}
            );

            const updatedGame: ISavedGame = await this.gameService.findOneAndUpdate(
                { combat_id },
                updatedValue,
                { new: true },
            );

            await this.runSideEffectOnCompletedGame(updatedGame);

            return successResponse('Подтверждение игроком статуса разрыва соединения успешно', updatedGame, res);
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

    /**
     * Получение краткой информации о герое одной случайной игры из последних 50
     */
    public async getStatHeroRandomGame(req: Request, res: Response) {
        try {
            const allGames: any[] = await this.gameService.getLast50Games()
            const random_game_index = Math.floor(Math.random() * allGames.length)
            const random_game = allGames[random_game_index]
            const first_player_data = random_game.players[0]

            const oneRandomGameShortInfo = {
                attack: first_player_data.attack,
                defence: first_player_data.defence,
                race: first_player_data.race,
                spell_power: first_player_data.spell_power,
                knowledge: first_player_data.knowledge,
                _id: random_game._id,
            }

            successResponseWithoutMessage(oneRandomGameShortInfo, res)
        } catch (error) {
            internalError(error, res);
        }
    }
}