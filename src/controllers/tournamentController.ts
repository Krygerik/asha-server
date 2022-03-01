import {Request, Response} from "express";
import {IRegisterParticipantBody, ITournament, TournamentService} from "../modules/tournament";
import {
    failureResponse,
    insufficientParameters,
    internalError,
    mongoError,
    successResponse,
} from "../modules/common/services";
import {GameService} from "../modules/game";
import {AccountService} from "../modules/account";
import {logger} from "../utils";

export class TournamentController {
    private accountService: AccountService = new AccountService();
    private gameService: GameService = new GameService();
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

            const mapUsersIdToUserInfo = await this.accountService.getMappingUserIdToUserShortInfo(tournament.users);

            const allGameInToTournament: string[] = tournament.grid.reduce((acc, round) => ([
                ...acc,
                ...round.games,
            ]), [] as string[]);

            const mapGameIdToShortGameInfo = await this.gameService.getMappingShortGamesInfoByGameIds(allGameInToTournament);

            successResponse(
                'Полная информация о турнире получена успешно',
                {
                    ...tournament,
                    mapUsersIdToUserInfo,
                    mapGameIdToShortGameInfo
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
            const updatedUser = await this.accountService.addAccountParticipantTournament(userId, tournament_id);

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

            const isStartedTournament: boolean = await this.tournamentService.getIsStartedTournament(tournament_id);

            if (!isStartedTournament) {
                await this.tournamentService.removeParticipantFromTournament(tournament_id, userId);
            }

            if (isStartedTournament) {
                await this.tournamentService.setParticipantTechnicalLose(tournament_id, userId);
            }

            successResponse('Вы успешно сняли свою регистрацию на турнире', null, res);
        } catch (error) {
            logger.error(
                'setParticipantTechnicalLose: Проставление игроку технического поражения',
                { metadata: { error }
                }
            );
            internalError(error, res);
        }
    }

    /**
     * Выставление игроку технического поражения на турнире
     */
    public async setParticipantTechnicalLose(req: Request, res: Response) {
        try {
            const { tournament_id, user_id }: { tournament_id?: string; user_id: string } = req.body;

            if (!tournament_id || !user_id) {
                return insufficientParameters(res);
            }

            await this.tournamentService.setParticipantTechnicalLose(tournament_id, user_id);

            successResponse(
                'Игроку успешно проставлено техническое поражение на турнире',
                { tournament_id, user_id },
                res,
            );
        } catch (error) {
            internalError(error, res);
        }
    }
}