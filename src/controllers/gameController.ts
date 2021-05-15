import {Request, Response} from "express";
import {filter, isUndefined, map, omit, uniq} from "lodash";
import {
    GameService,
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
    insufficientParameters, internalError,
    mongoError,
    successResponse,
} from "../modules/common/services";
import {AuthService} from "../modules/auth";

export class GameController {
    private gameService: GameService = new GameService();
    private authService: AuthService = new AuthService();

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
    public async getShortGameInfoList(req: Request, res: Response) {
        try {
            if (!isUndefined(req.query.items) && typeof req.query.items !== "string") {
                return incorrectParameters(res);
            }

            const allShortGameInfoList: IShortGame[] = await this.gameService.getShortGameInfoList(req.query.items);

            const gameDataWithNicknameList = await this.addNicknamesToGameInfoList(allShortGameInfoList);

            return successResponse(
                'Список краткой информации по всем играм получен успешно',
                gameDataWithNicknameList,
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
}