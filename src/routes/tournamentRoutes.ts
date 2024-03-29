import {Application, Request, Response} from "express";
import {TournamentController} from "../controllers/tournamentController";

export class TournamentRoutes {
    private tournamentController: TournamentController = new TournamentController();

    public route(app: Application) {
        /**
         * Создание нового турнира
         */
        app.post(
            '/api/tournament/create',
            (req: Request, res: Response) => {
                this.tournamentController.createTournament(req, res);
            }
        );

        /**
         * Удаление существующего турнира
         */
        app.post('/api/tournament/delete', (req: Request, res: Response) => {
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
        app.post('/api/tournament/register', (req: Request, res: Response) => {
            this.tournamentController.registerParticipant(req, res);
        })

        /**
         * Снятие кандидатуры игрока на турнире (при регистрации и при запущенном турнире)
         */
        app.post('/api/tournament/leave', (req: Request, res: Response) => {
            this.tournamentController.removeParticipantFromTournament(req, res);
        })

        /**
         * Проставление игроку технического поражения на турнире
         */
        app.post('/api/tournament/set-tech-lose', (req: Request, res: Response) => {
            this.tournamentController.setParticipantTechnicalLose(req, res);
        })
    }
}