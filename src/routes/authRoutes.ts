import {Application, Request, Response} from "express";
import {AuthController} from "../controllers/authController";

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
        app.get('/api/auth/get-profile', AuthController.authMiddleware, (req: Request, res: Response) => {
            this.authController.getProfile(req, res);
        });

        /**
         * Получение данных переданного пользователя
         */
        app.get('/api/auth/get-profile/:id', AuthController.authMiddleware, (req: Request, res: Response) => {
            this.authController.getProfile(req, res);
        });

        /**
         * Получение списка пользователей с ID и никнеймом всех зарегистрированных игроков
         */
        app.get('/api/auth/get-users', (req: Request, res: Response) => {
            this.authController.getAllUsersList(req, res);
        });
    };
}