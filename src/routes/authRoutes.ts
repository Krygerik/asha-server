import {Application, Request, Response} from "express";
import {AuthController} from "../controllers/authController";
import {ERoles} from "../modules/auth";

export class AuthRoutes {
    private authController: AuthController = new AuthController();

    public route(app: Application) {
        /**
         * Регистрация пользователя в системе
         */
        app.post('/api/auth/registration', (req: Request, res: Response) => {
            this.authController.registration(req, res);
        });

        /**
         * Регистрация пользователя в системе
         */
        app.post('/api/auth/login', (req: Request, res: Response) => {
            this.authController.login(req, res);
        });

        /**
         * Получение данных текущего пользователя
         */
        app.get('/api/auth/get-profile', AuthController.authMiddleware(), (req: Request, res: Response) => {
            this.authController.getProfile(req, res);
        });

        /**
         * Получение данных переданного пользователя
         */
        app.get('/api/auth/get-profile/:id', AuthController.authMiddleware(), (req: Request, res: Response) => {
            this.authController.getProfile(req, res);
        });

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
        app.post('/api/auth/update-user-info', AuthController.authMiddleware(), (req: Request, res: Response) => {
            this.authController.updateUserInfo(req, res);
        })

        /**
         * Обновление игровых данных пользователя
         */
        app.post('/api/auth/update-user-game-info', AuthController.authMiddleware(ERoles.ADMIN), (req: Request, res: Response) => {
            this.authController.updateUserGameInfo(req, res);
        })
    };
}