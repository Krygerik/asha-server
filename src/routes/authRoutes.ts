import {Application, Request, Response} from "express";
import {AuthController} from "../controllers/authController";

export class AuthRoutes {
    private authController: AuthController = new AuthController();

    public route(app: Application) {
        /**
         * Получение списка пользователей с ID и никнеймом всех зарегистрированных игроков
         */
        app.get('/api/auth/get-users', (req: Request, res: Response) => {
            this.authController.getAllUsersList(req, res);
        });

        /**
         * Получение списка пользователей с ID и никнеймом всех зарегистрированных игроков
         */
        app.get('/api/auth/get-player-rating-list', (req: Request, res: Response) => {
            this.authController.getTopRatingUserList(req, res);
        });

        /**
         * Обновление изменяемых данных пользователя
         */
        app.post('/api/auth/update-user-info', (req: Request, res: Response) => {
            this.authController.updateUserInfo(req, res);
        })

        /**
         * Обновление игровых данных пользователя
         */
        app.post('/api/auth/update-user-game-info', (req: Request, res: Response) => {
            this.authController.updateUserGameInfo(req, res);
        })

        /**
         * Удаление игровых данных игрока
         */
        app.post('/api/auth/delete-user', (req: Request, res: Response) => {
            this.authController.deleteAllUserDataAndLinks(req, res);
        })
    };
}