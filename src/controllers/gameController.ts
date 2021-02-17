import {Request, Response} from "express";
import {GameService} from "../modules/game/service";
import {IGame} from "../modules/game/model";
import {hasMissingField} from "../modules/game/utils";
import {failureResponse, insufficientParameters, mongoError, successResponse} from "../modules/common/services";

export class GameController {
    private gameService: GameService = new GameService();

    public createGame(req: Request, res: Response) {
        if (hasMissingField(req.body)) {
            return insufficientParameters(res);
        }

        const gameParams: IGame = {
            combat_id: req.body.combat_id,
            date: req.body.date,
            loosing_player: {
                ...req.body.loosing_player
            },
            winning_player: {
                ...req.body.winning_player
            },
        };

        this.gameService.createGame(gameParams, (err: any, gameData: IGame) => {
            if (err) {
                return mongoError(err, res);
            }

            successResponse('create game successfull', gameData, res);
        })
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