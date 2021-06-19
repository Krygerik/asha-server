import {Application, Request, Response} from "express";
import { AuthController } from "../controllers/authController";
import {TournamentController} from "../controllers/tournamentController";
import {ERoles} from "../modules/auth/model";

export class TournamentRoutes {
    private tournamentController: TournamentController = new TournamentController();

    public route(app: Application) {
        /**
         * Создание нового турнира
         */
        app.post('/api/tournament/create', AuthController.authMiddleware(ERoles.ADMIN), (req: Request, res: Response) => {
            this.tournamentController.createTournament(req, res);
        });

        /**
         * Удаление существующего турнира
         */
        app.post('/api/tournament/delete', AuthController.authMiddleware(ERoles.ADMIN), (req: Request, res: Response) => {
            this.tournamentController.deleteTournament(req, res);
        })

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
        app.post('/api/tournament/register', AuthController.authMiddleware(), (req: Request, res: Response) => {
            this.tournamentController.registerParticipant(req, res);
        })

        /**
         * Снятие кандидатуры игрока на турнире
         */
        app.post('/api/tournament/leave', AuthController.authMiddleware(), (req: Request, res: Response) => {
            this.tournamentController.removeParticipantFromTournament(req, res);
        })
    }
}