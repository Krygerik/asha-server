import { ClientLogsController } from "../controllers/clientLogsController";
import {Application, Request, Response} from "express";
import {AuthController} from "../controllers/authController";
import {loggerMiddleware} from "../utils";

export class ClientLogsRoutes {
    private clientLogsController: ClientLogsController = new ClientLogsController();

    public route(app: Application) {
        app.post('/api/log/create', [AuthController.authMiddleware(), loggerMiddleware], (req: Request, res: Response) => {
            this.clientLogsController.createClientLogRecord(req, res);
        })
    }
}
