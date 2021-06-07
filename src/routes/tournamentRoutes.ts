import {Application, Request, Response} from "express";
import {TournamentController} from "../controllers/tournamentController";

export class TournamentRoutes {
    private tournamentController: TournamentController = new TournamentController();

    public route(app: Application) {
        /**
         * Регистрация нового турнира
         */
        app.post('/api/tournament/create', (req: Request, res: Response) => {
            this.tournamentController.createTournament(req, res);
        });
    }
}