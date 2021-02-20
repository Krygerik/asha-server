import {Request, Response} from "express";
import {GameService, IGame, hasMissingField} from "../modules/game";
import {
    failureResponse,
    insufficientParameters,
    mongoError,
    successResponse,
} from "../modules/common/services";
import {IMappingNicknameToGame, MappingNicknameToGameService} from "../modules/mapping-nickname-to-game";

export class GameController {
    private gameService: GameService = new GameService();
    private mappingNicknameToGameService: MappingNicknameToGameService = new MappingNicknameToGameService();

    public createGame(req: Request, res: Response) {
        if (hasMissingField(req.body)) {
            return insufficientParameters(res);
        }

        this.mappingNicknameToGameService.findNicknameListByCombatId(
            req.body.combat_id,
            (err: any, docList: IMappingNicknameToGame[]) => {
                if (err) {
                    return mongoError(err, res);
                }

                const loosingNickname = docList
                    .map((doc: IMappingNicknameToGame) => doc.nickname)
                    .find((nickname: string) => nickname !== req.body.winning_player.nickname);

                const gameParams: IGame = {
                    combat_id: req.body.combat_id,
                    date: req.body.date,
                    loosing_player: {
                        ...req.body.loosing_player,
                        nickname: loosingNickname,
                    },
                    winning_player: {
                        ...req.body.winning_player,
                    },
                };

                this.gameService.createGame(gameParams, (err: any, gameData: IGame) => {
                    if (err) {
                        return mongoError(err, res);
                    }

                    successResponse('create game successfull', gameData, res);
                })
            }
        );
    }

    public getGame(req: Request, res: Response) {
        if (!req.params.id) {
            return insufficientParameters(res);
        }

        const gameFilter = { _id: req.params.id };
        this.gameService.findGame(gameFilter, (err: any, gameData: IGame) => {
            if (err) {
                return mongoError(err, res);
            }

            successResponse('get game successfull', gameData, res);
        })
    }

    public updateGame(req: Request, res: Response) {
        if (!req.params.id) {
            return insufficientParameters(res);
        }

        const gameFilter = { _id: req.params.id };
        this.gameService.findGame(gameFilter, (err: any, gameData: IGame) => {
            if (err) {
                return mongoError(err, res);
            }

            if (!gameData) {
                return failureResponse('invalid game', null, res);
            }

            const gameParams: IGame = {
                _id: req.params.id,
                combat_id: req.body.combat_id,
                date: req.body.date,
                loosing_player: {
                    ...req.body.loosing_player
                },
                winning_player: {
                    ...req.body.winning_player
                },
            };

            this.gameService.updateGame(gameParams, (updateError: any) => {
                if (updateError) {
                    return mongoError(updateError, res);
                }

                successResponse('Update game successfull', null, res);
            })
        })
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