import {Request, Response} from "express";
import {IRegisterParticipantBody, ITournament, TournamentService} from "../modules/tournament";
import {
    failureResponse,
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

            const tournament = this.tournamentService.getTournament(tournamentData);

            if (tournament) {
                return failureResponse('Такой турнир уже зарегистрирован', null, res);
            }

            await this.tournamentService.createTournament(tournamentData);

            successResponse('Турнир успешно создан', null, res);
        } catch (error) {
            mongoError(error, res);
        }
    }

    /**
     * Удаление турнира
     */
    public async deleteTournament(req: Request, res: Response) {
        try {
            const { tournament_id }: { tournament_id?: string } = req.body;

            if (!tournament_id) {
                return insufficientParameters(res);
            }

            // @ts-ignore
            const deletedTournament: ITournament | null = await this.tournamentService.deleteTournament(tournament_id);

            if (!deletedTournament) {
                return failureResponse('Такого турнира не существует', null, res);
            }

            successResponse(`Турнир "${deletedTournament.name}" успешно удален`, null, res);
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

            successResponse('Полная информация о турнире получена успешно', tournamentDoc.toObject(), res);
        } catch (error) {
            internalError(error, res);
        }
    }

    /**
     * Регистрация игрока в турнире
     */
    public async registerParticipant(req: Request, res: Response) {
        try {
            const { tournament_id, userId }: IRegisterParticipantBody = req.body;

            if (!tournament_id) {
                return insufficientParameters(res);
            }

            const participantList: string[] = await this.tournamentService.getParticipantListByTournamentId(tournament_id);

            /**
             * Если он уже является участником турнира - выкидываем
             */
            if (participantList.includes(userId)) {
                return failureResponse('Пользователь уже участвует в турнире', null, res);
            }

            await this.tournamentService.addParticipantToTournament(tournament_id, userId);

            successResponse('Игрок успешно зарегистрирован', null, res);
        } catch (error) {
            internalError(error, res);
        }
    }

    /**
     * Снятие кандидатуры игрока на турнире
     */
    public async removeParticipantFromTournament(req: Request, res: Response) {
        try {
            const { tournament_id, userId }: IRegisterParticipantBody = req.body;

            if (!tournament_id) {
                return insufficientParameters(res);
            }

            await this.tournamentService.removeParticipantFromTournament(tournament_id, userId);

            successResponse('Вы успешно сняли свою регистрацию на турнире', null, res);
        } catch (error) {
            internalError(error, res);
        }
    }
}