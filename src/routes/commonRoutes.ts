import {Application, Request, Response} from 'express';
import {failureResponse} from "../modules/common/services";

export class CommonRoutes {
    public route(app: Application) {
        // Mismatch URL
        app.all('*', function (req: Request, res: Response) {
            failureResponse('Некорректный URL', null, res);
        });
    }
}