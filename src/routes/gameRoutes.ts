import {GameController} from "../controllers/gameController";
import {Application, Request, Response} from "express";

export class GameRoutes {
    private gameController: GameController = new GameController();

    public route(app: Application) {
        app.post('/api/game', (req: Request, res: Response) => {
            this.gameController.createGame(req,res);
        });

        app.get('/api/game/:id', (req: Request, res: Response) => {
            this.gameController.getGame(req, res);
        });

        app.get('/api/get-short-game-info-list', (req: Request, res: Response) => {
            this.gameController.getShortGameInfoList(req, res);
        });

        app.get('/api/get-games-by-nickname', (req: Request, res: Response) => {
            this.gameController.getShortGameInfoListByNickname(req, res);
        });

        app.put('/api/game/:id', (req: Request, res: Response) => {
            this.gameController.updateGame(req, res);
        });

        app.delete('/api/game/:id', (req: Request, res: Response) => {
            this.gameController.deleteGame(req, res);
        });
    };
}