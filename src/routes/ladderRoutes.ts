import {Application, Request, Response} from "express";
import { LadderController } from "../controllers/ladderController";

export class LadderRoutes {
    private ladderController: LadderController = new LadderController();

    public route(app: Application) {
        /**
         * Создание ладдерной встречи
         */
        app.post('/api/ladder/create', (req: Request, res: Response) => {
            this.ladderController.createLadder(req, res);
        })

        /**
         * Создание ладдерной встречи
         */
        app.post('/api/ladder/cancel', (req: Request, res: Response) => {
            this.ladderController.cancelLadder(req, res);
        })
    }
}