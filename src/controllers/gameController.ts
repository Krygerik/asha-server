import {Request, Response} from "express";
import {filter, isUndefined, omit, uniq} from "lodash";
import {
    IInputGameData,
    GameService,
    ISavedGame, IInputPlayersData, IWinnerRequestDto, IShortGame,
} from "../modules/game";
import {
    incorrectParameters,
    insufficientParameters,
    mongoError,
    successResponse,
} from "../modules/common/services";
import {AuthService} from "../modules/auth";

export class GameController {
    private gameService: GameService = new GameService();
    private authService: AuthService = new AuthService();

    /**
     * Сохранение основных характеристик игрока с его никнеймом
     * Ожидаем от обоих игроков по такому запросу для заполнения основных данных об игре
     */
    public saveGameParams(req: Request, res: Response) {
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
    }

    /**
     * Сохранение победителя и определение красного игрока
     */
    public saveGameWinner(req: Request, res: Response) {
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
    }

    public getGame(req: Request, res: Response) {
        if (!req.params.id) {
            return insufficientParameters(res);
        }

        const gameFilter = { _id: req.params.id };
        this.gameService.findGame(gameFilter, (err: any, gameData: ISavedGame) => {
            if (err) {
                return mongoError(err, res);
            }

            successResponse('get game successfull', gameData, res);
        })
    }

    /**
     * Получение краткого списка всех игр
     */
    public async getShortGameInfoList(req: Request, res: Response) {
        if (!isUndefined(req.query.items) && typeof req.query.items !== "string") {
            return incorrectParameters(res);
        }

        const allShortGameInfoList = await this.gameService.getShortGameInfoList(req.query.items);

        return successResponse(
            'Список краткой информации по всем играм получен успешно',
            allShortGameInfoList,
            res,
        )
    }

    /**
     * Получение списка игр с краткой информацией по нику игрока
     */
    public async getShortGameInfoListByUserId(req: Request, res: Response) {
        const userId = req.query.userId;

        if (typeof userId !== 'string') {
            return insufficientParameters(res);
        }

        let shortGameInfoList: IShortGame[] = await this.gameService.getShortGamesInfoListByUserId(userId);

        const relatedUserIdList = [];

        shortGameInfoList.forEach(item => item.players.forEach(player => {
            relatedUserIdList.push(player.user_id);
        }));

        const filteredRelatedUserIdList = filter<string>(uniq(relatedUserIdList), Boolean);

        const mappingIdToNicknames = await this.authService.getRelatedMappingUserIdToUserNickname(filteredRelatedUserIdList);

        const shortGameInfoWithNicknamesList = shortGameInfoList.map(item => ({
            ...item,
            players: item.players.map(player => ({
                ...player,
                nickname: mappingIdToNicknames[player.user_id]
            }))
        }));

        return successResponse(
            'Список игр c краткой информацией получен успешно',
            shortGameInfoWithNicknamesList,
            res,
        );
    }

    /**
     * Получение списка игр с краткой информацией текущего пользователя
     */
    public async getShortGameInfoByUserId(req: Request, res: Response) {
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
    }
}