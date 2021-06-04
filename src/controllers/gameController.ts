import {Request, Response} from "express";
import {filter, flatten, map, omit, uniq} from "lodash";
import {
    GameService,
    IFilterGames,
    IShortFilter,
    IFindGameOptions,
    IInputGameData,
    IInputPlayersData,
    ISavedGame,
    ISavedPlayer,
    IShortGame,
    IShortPlayer,
    IWinnerRequestDto,
} from "../modules/game";
import {
    incorrectParameters,
    insufficientParameters,
    internalError,
    mongoError,
    successResponse,
} from "../modules/common/services";
import {AuthService} from "../modules/auth";
import {DictionariesService, IDictionary} from "../modules/dictionaries";
import {EDictionaryName, IRecords} from "../modules/dictionaries/model";

export class GameController {
    private gameService: GameService = new GameService();
    private authService: AuthService = new AuthService();
    private dictionaryService: DictionariesService = new DictionariesService();

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
    public saveGameParams(req: Request, res: Response) {
        try {
            // @ts-ignore
            const gameData: IInputPlayersData = {
                ...omit(req.body, ['userId']),
                user_id: req.body.userId,
            }

            this.gameService.createOrUpdateGame(gameData, (err: any, gameData: IInputGameData) => {
                if (err) {
                    return mongoError(err, res);
                }

                successResponse('create game successfull', gameData, res);
            });
        } catch (error) {
            internalError(error, res);
        }
    }

    /**
     * Сохранение победителя и определение красного игрока
     */
    public saveGameWinner(req: Request, res: Response) {
        try {
            // @ts-ignore
            const gameData: IWinnerRequestDto = {
                ...omit(req.body, ['userId']),
                user_id: req.body.userId,
            }

            this.gameService.saveGameWinner(gameData, (err: any, gameData: IInputGameData) => {
                if (err) {
                    return mongoError(err, res);
                }

                successResponse('Победитель игры обозначен!', gameData, res);
            });
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
    public async setGameDisconnectStatusByCombatId(req: Request, res: Response) {
        try {
            const { combat_id } = req.body;

            const updatedDocs = await this.gameService.setGameDisconnectStatus(combat_id);

            return successResponse(
                `Игре с combat_id: ${combat_id} проставлен статус разрыва соединения`,
                updatedDocs,
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