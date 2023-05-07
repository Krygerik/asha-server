import {Application, Request, Response} from "express";
import {DictionaryController} from "../controllers/dictionaryController";

export class DictionaryRoutes {
    private dictionaryController: DictionaryController = new DictionaryController();

    public route(app: Application) {
        /**
         * Получение всех возможных словарей
         */
        app.get('/api/get-dictionaries', (req: Request, res: Response) => {
            this.dictionaryController.getDictionaries(req, res);
        });

        /**
         * Получение внутренних словарей АСХА
         */
        app.get('/api/get-asha-dictionaries', (req: Request, res: Response) => {
            this.dictionaryController.getAshaDictionaries(req, res);
        });

        /**
         * Получение словаря по названию
         */
        app.get('/api/get-dictionary', (req: Request, res: Response) => {
            this.dictionaryController.getDictionary(req, res);
        });

        /**
         * Update
         */
        app.get('/api/update', (req: Request, res: Response) => {
            this.dictionaryController.getUpdate(req, res);
        });
    }
}
