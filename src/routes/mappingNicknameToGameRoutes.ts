import {Application, Request, Response} from "express";
import {MappingNicknameToGameController} from "../controllers/mappingNicknameToGameController";


export class MappingNicknameToGameRoutes {
    private mappingNicknameToGameController: MappingNicknameToGameController = new MappingNicknameToGameController();

    public route(app: Application) {
        app.get('/api/map-nick-to-game', (req: Request, res: Response) => {
            this.mappingNicknameToGameController.createRecord(req, res);
        });
    }
}
