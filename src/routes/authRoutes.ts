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
    };
}