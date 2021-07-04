import {Request, Response} from "express";
import {IRegisterParticipantBody, ITournament, TournamentService} from "../modules/tournament";
import {
    failureResponse,
    insufficientParameters,
    internalError,
    mongoError,
    successResponse,
} from "../modules/common/services";
import {AuthService} from "../modules/auth";

export class TournamentController {
    private authService: AuthService = new AuthService();
    private tournamentService: TournamentService = new TournamentService();

    public async createTournament(req: Request, res: Response) {
        try {
            const tournamentData: ITournament = req.body;

            const tournament = await this.tournamentService.getTournament({ name: tournamentData.name });

            if (tournament) {
                return failureResponse('Турнир с таким названием уже зарегистрирован', null, res);
            }

            // @ts-ignore
            const createdTournament: ITournament | null = await this.tournamentService.createTournament(tournamentData);

            if (!createdTournament) {
                return failureResponse('Не удалось создать турнир', null, res);
            }

            successResponse('Турнир успешно создан', createdTournament, res);
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

            const tournament: ITournament = await this.tournamentService.getTournament({ _id: id });

            const mappingUserIdToShortUserInfo = await this.authService.getMappingUsersIdToUserShortInfo(tournament.users);

            successResponse(
                'Полная информация о турнире получена успешно',
                {
                    ...tournament,
                    mapUsersIdToUserInfo: mappingUserIdToShortUserInfo
                },
                res
            );
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

            const tournament: ITournament | null = await this.tournamentService.getTournament({ _id: tournament_id });

            if (!tournament) {
                return failureResponse('Не удалось найти турнир для регистрации', null, res);
            }

            if (tournament.started) {
                return failureResponse('Регистрация на турнир уже закрыта', null, res);
            }

            /**
             * Если он уже является участником турнира - выкидываем
             */
            if (tournament.users.includes(userId)) {
                return failureResponse('Пользователь уже участвует в турнире', null, res);
            }

            await this.tournamentService.addParticipantToTournament(tournament_id, userId);

            await this.tournamentService.checkTournamentOnMaximumPlayer(tournament_id);

            /**
             * Добавляем турнир в список турниров, в которых участвует пользователь
             */
            const updatedUser = await this.authService.addTournamentIdToUser(userId, tournament_id);

            if (!updatedUser) {
                return failureResponse(
                    'Не получилось добавить турнир в список турниров пользователя',
                    null,
                    res,
                );
            }

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