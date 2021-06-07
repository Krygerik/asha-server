import {Request, Response} from "express";
import {ITournament, TournamentService} from "../modules/tournament";
import {mongoError, successResponse} from "../modules/common/services";

export class TournamentController {
    private tournamentService: TournamentService = new TournamentService();

    public async createTournament(req: Request, res: Response) {
        try {
            const tournamentData: ITournament = req.body;

            await this.tournamentService.createTournament(tournamentData);

            successResponse('Турнир успешно создан', null, res);
        } catch (error) {
            mongoError(error, res);
        }
    }
}