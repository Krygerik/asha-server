import {Application, Request, Response} from "express";
import { AuthController } from "../controllers/authController";
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

        /**
         * Регистрация игрока в турнире
         */
        app.post('/api/tournament/register', AuthController.authMiddleware, (req: Request, res: Response) => {
            this.tournamentController.registerParticipant(req, res);
        })

        /**
         * Снятие кандидатуры игрока на турнире
         */
        app.post('/api/tournament/leave', AuthController.authMiddleware, (req: Request, res: Response) => {
            this.tournamentController.removeParticipantFromTournament(req, res);
        })
    }
}