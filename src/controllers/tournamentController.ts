import {Request, Response} from "express";
import {ITournament, TournamentService} from "../modules/tournament";
import {
    insufficientParameters,
    internalError,
    mongoError,
    successResponse,
} from "../modules/common/services";

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

    /**
     * Получение списка всех турниров
     */
    public async getAllTournaments(req: Request, res: Response) {
        try {
            const allTournamentsDocs = await this.tournamentService.getAllTournaments();

            successResponse('Список всех турниров получен', allTournamentsDocs, res);
        } catch (error) {
            mongoError(error, res);
        }
    }

    /**
     * Получение полной информации о конкретном турнире
     */
    public async getTournament(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return insufficientParameters(res);
            }

            const tournamentDoc = await this.tournamentService.getTournament({ _id: id })

            successResponse('get game successfull', tournamentDoc.toObject(), res);
        } catch (error) {
            internalError(error, res);
        }
    }
}