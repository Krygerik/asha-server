import {Application, Request, Response} from "express";
import {AuthController} from "../controllers/authController";
import {GameController} from "../controllers/gameController";

export class GameRoutes {
    private gameController: GameController = new GameController();

    public route(app: Application) {
        /**
         * Сохранение основных характеристик игрока с его никнеймом
         */
        app.post('/api/save-game-params', AuthController.authMiddleware, (req: Request, res: Response) => {
            this.gameController.saveGameParams(req,res);
        });

        /**
         * Сохранение победителя и определение красного игрока
         */
        app.post('/api/save-game-winner', AuthController.authMiddleware, (req: Request, res: Response) => {
            this.gameController.saveGameWinner(req,res);
        });

        /**
         * Получение полной информации по конкретной игре
         */
        app.get('/api/game/:id', (req: Request, res: Response) => {
            this.gameController.getGame(req, res);
        });

        /**
         * Получение краткой информации по всем играм
         */
        app.get('/api/get-short-game-info-list', (req: Request, res: Response) => {
            this.gameController.getShortGameInfoList(req, res);
        });

        /**
         * Получение краткой информации по всем играм по user_id
         */
        app.get('/api/get-games-by-user-id', (req: Request, res: Response) => {
            this.gameController.getShortGameInfoListByUserId(req, res);
        })

        /**
         * Получение краткой информации по последним играм пользователя
         */
        app.get('/api/get-games-by-user', AuthController.authMiddleware, (req: Request, res: Response) => {
            this.gameController.getShortGameInfoByUserId(req, res);
        })
    };
}