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

        /**
         * Получение списка всех турниров
         */
        app.get('/api/tournament/get-all', (req: Request, res: Response) => {
            this.tournamentController.getAllTournaments(req, res);
        })

        /**
         * Получение информации о турнире по его id
         */
        app.get('/api/tournament/:id', (req: Request, res: Response) => {
            this.tournamentController.getTournament(req, res);
        })
    }
}