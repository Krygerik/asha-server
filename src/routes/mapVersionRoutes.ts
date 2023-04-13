import { MapVersionController } from "../controllers/mapVersionController";
import {Application, Request, Response} from "express";

export class MapVersionRoutes {
    private mapVersionController: MapVersionController = new MapVersionController();

    public route(app: Application) {
        /**
         * Получение информации по переданной версии карты
         */
        app.get('/api/map-version/get-info-by-value', (req: Request, res: Response) => {
            this.mapVersionController.getMapVersionInfoByValue(req, res);
        });

        /**
         * Получение списка всех фиксируемых типов карты
         */
        app.get('/api/map-version/get-map-list', (req: Request, res: Response) => {
            this.mapVersionController.getMapTypeList(req, res);
        })
    }
}