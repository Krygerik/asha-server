import {Application, Request, Response} from "express";
import {GameController} from "../controllers/gameController";
import { loggerMiddleware } from "../utils";

export class GameRoutes {
    private gameController: GameController = new GameController();

    public route(app: Application) {
        /**
         * Сохранение основных характеристик игрока с его никнеймом
         */
        app.post('/api/save-game-params', loggerMiddleware, (req: Request, res: Response) => {
            this.gameController.saveGameParams(req,res);
        });

        /**
         * Сохранение победителя и определение красного игрока
         */
        app.post('/api/save-game-winner', loggerMiddleware, (req: Request, res: Response) => {
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
        app.post('/api/get-short-game-info-list', (req: Request, res: Response) => {
            this.gameController.getShortGameInfoList(req, res);
        });

        /**
         * Получение краткой информации по всем играм по user_id
         */
        app.get('/api/get-games-by-user-id', (req: Request, res: Response) => {
            this.gameController.getShortGameInfoListByUserId(req, res);
        })

        /**
         * Проставление статуса разрыва соединения
         */
        app.post('/api/set-game-disconnect-status', loggerMiddleware, (req: Request, res: Response) => {
            this.gameController.setGameDisconnectStatusByCombatId(req, res);
        })

        /**
         * Получение статистики побед по расам
         */
        app.post('/api/get-races-win-rate', (req: Request, res: Response) => {
            this.gameController.getRacesWinRate(req, res);
        });

        /**
         * Получение информации о первоначальных характеристиках героя и его расе из случайной игры
         */
         app.get('/api/get-quiz-stat-hero', (req: Request, res: Response) => {
            this.gameController.getStatHeroRandomGame(req, res);
        });
    };
}   