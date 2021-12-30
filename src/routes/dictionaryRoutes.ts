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
         * Получение всех возможных словарей
         */
        app.get('/api/get-asha-dictionaries', (req: Request, res: Response) => {
            this.dictionaryController.getAshaDictionaries(req, res);
        });
    }
}
