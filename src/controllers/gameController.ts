import {Request, Response} from "express";
import {isEmpty, isUndefined} from "lodash";
import {
    IInputGameData,
    GameService,
    ISavedGame,
} from "../modules/game";
import {
    failureResponse,
    incorrectParameters,
    insufficientParameters,
    mongoError,
    successResponse,
} from "../modules/common/services";
import {MappingNicknameToGameService} from "../modules/mapping-nickname-to-game";

export class GameController {
    private gameService: GameService = new GameService();
    private mappingNicknameToGameService: MappingNicknameToGameService = new MappingNicknameToGameService();

    /**
     * Сохранение основных характеристик игрока с его никнеймом
     * Ожидаем от обоих игроков по такому запросу для заполнения основных данных об игре
     */
    public saveGameParams(req: Request, res: Response) {
        // Проверяем, что есть хотя бы одно поле. Валидацию по полям сделает mongodb
        if (isEmpty(req.body)) {
            return insufficientParameters(res);
        }

        this.gameService.createOrUpdateGame(req.body, (err: any, gameData: IInputGameData) => {
            if (err) {
                return mongoError(err, res);
            }

            successResponse('create game successfull', gameData, res);
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
    public async getShortGameInfoListByNickname(req: Request, res: Response) {
        const nickname = req.query.nickname;

        if (typeof nickname !== 'string') {
            return insufficientParameters(res);
        }

        const combatIdList = await this.mappingNicknameToGameService.getGamesByNickname(nickname);

        const shortGameInfoList = await this.gameService.getShortGamesInfoListByCombatId(combatIdList);

        return successResponse('Список игр c краткой информацией получен успешно', shortGameInfoList, res);
    }

    public deleteGame(req: Request, res: Response) {
        if (!req.params.id) {
            return insufficientParameters(res);
        }

        this.gameService.deleteGame(req.params.id, (err: any, deleteDetails: any) => {
            if (err) {
                return mongoError(err, res);
            }

            if (deleteDetails.deletedCount == 0) {
                return failureResponse('invalid game', null, res);
            }

            successResponse('delete game successfull', null, res);
        })
    }
}