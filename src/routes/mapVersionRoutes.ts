import { MapVersionController } from "../controllers/mapVersionController";
import {Application, Request, Response} from "express";

export class MapVersionRoutes {
    private mapVersionController: MapVersionController = new MapVersionController();

    public route(app: Application) {
        /**
         * Регистрация пользователя в системе
         */
        app.get('/api/map-version/get-info-by-value', (req: Request, res: Response) => {
            this.mapVersionController.getMapVersionInfoByValue(req, res);
        });
    }
}