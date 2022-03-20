import { isNil } from "lodash";
import {logger} from "../../utils";
import {EPlayerColor} from "../game";
import {TournamentModel} from "./tournament-schema";
import {
    ITournament,
    ITournamentIdWithNumberOfRound,
    ITournamentPlayer,
    ITournamentRound,
} from "./tournament-model";
import {
    AUTO_WIN,
    BOUNDARY_MEMBER_COUNT_LIST,
    mapCountMemberToCountStage,
    mapRoundFormatToMaximumCountGame,
} from "./tournament-constants";
import {
    getChangeGridDataQuery,
    getFinishRoundDataQuery,
    getMainDataQuery,
} from "./tournament-utils";

/**
 * Действия непосредственно с таблицей с турнирами
 */
export class TournamentService {
    constructor() {
        this.checkTournamentByCron();
    }

    /**
     * Закрытие регистраций на турниры по шедулеру каждые 10 минут
     */
    private checkTournamentByCron() {
        const FIVE_MINUTE = 600000;

        setInterval(() => {
            this.closeRegistrationInOpenTournaments()
                .catch((e) => console.log('Ошибка при закрытии регистрации турнира: ', e.toString()));
        }, FIVE_MINUTE);
    }

    /**
     * Закрытие регистраций на турниры, в которых время на регистрацию истекло
     */
    private async closeRegistrationInOpenTournaments() {
        // @ts-ignore
        const openToursDocs = await TournamentModel.find(
            {
                start_date: { $lt: new Date().toISOString() },
                started: false,
            }
        );

        openToursDocs.forEach(openTourDoc => {
            // @ts-ignore
            const openTour: ITournament = openTourDoc.toObject();

            TournamentService.closeRegistrationInSingleTournament(openTour);
        })
    }

    /**
     * Завершение регистрации на отдельный турнир
     */
    private static async closeRegistrationInSingleTournament(tournament: ITournament) {
        const grid = TournamentService.generateTournamentGrid(tournament);

        await TournamentModel.findOneAndUpdate(
            { _id: tournament._id },
            {
                $set: {
                    started: true,
                    grid,
                }
            }
        );
    }

    /**
     * Проверка турнира на максимальное количество игроков для закрытия регистрации
     */
    public async checkTournamentOnMaximumPlayer(tournament_id: string) {
        const tournamentDoc = await TournamentModel.findOne({ _id: tournament_id });

        if (!tournamentDoc) {
            return null;
        }

        // @ts-ignore
        const tournament: ITournament = tournamentDoc.toObject();

        if (tournament.users.length >= tournament.maximum_player_count) {
            await TournamentService.closeRegistrationInSingleTournament(tournament);
        }
    }

    /**
     * Получение конечного списка участников турнира
     * Добавление авто-винов до пороговых значений для построения сетки
     */
    private static getTournamentMemberList(usersIdList: string[]): string[] {
        for (let i = 0; i < BOUNDARY_MEMBER_COUNT_LIST.length; i++) {
            if (usersIdList.length <= BOUNDARY_MEMBER_COUNT_LIST[i]) {
                return [
                    ...usersIdList,
                    ...new Array(BOUNDARY_MEMBER_COUNT_LIST[i] - usersIdList.length).fill(AUTO_WIN)
                ];
            }
        }
    }

    /**
     * Корректировка начальных раундов для игроков, которым не выпали оппоненты
     */
    private static resolveInitialAutoWins(grid: ITournamentRound[]): ITournamentRound[] {
        const roundWithAutoWins: ITournamentRound[] = grid.filter(
            (round: ITournamentRound) => round.players.find(
                (player: ITournamentPlayer) => player.user_id === AUTO_WIN
            )
        )

        return grid.map((round: ITournamentRound) => {
            /**
             * дочерние игры с автопобедой
             */
            const childRoundsWithAutoWin = roundWithAutoWins.filter(
                (roundWithAutoWin: ITournamentRound) => roundWithAutoWin.parent_round === round.number_of_round
            );

            /**
             * Является ли эта игра - игрой с автопобедой
             */
            const isRoundWithAutoWin = Boolean(
                roundWithAutoWins.find(
                (roundWithAutoWin: ITournamentRound) => roundWithAutoWin.number_of_round === round.number_of_round
            ));

            if (isRoundWithAutoWin) {
                const playerWOOpponent = round.players.find(
                    (player: ITournamentPlayer) => player.user_id !== AUTO_WIN
                )

                return {
                    ...round,
                    winner_id: playerWOOpponent.user_id,
                };
            }

            if (childRoundsWithAutoWin.length) {
                const livePlayers = [];

                childRoundsWithAutoWin.forEach((round: ITournamentRound) => {
                    livePlayers.push(round.players.find(
                        (player: ITournamentPlayer) => player.user_id !== AUTO_WIN
                    ))
                })

                return {
                    ...round,
                    players: livePlayers
                } as ITournamentRound;
            }

            return round;
        })
    }

    /**
     * Создание турнирной сетки
     */
    private static generateTournamentGrid(tournament: ITournament): ITournamentRound[] {
        const memberList = TournamentService.getTournamentMemberList(tournament.users);

        const countStage = mapCountMemberToCountStage[memberList.length];

        const grid = [] as ITournamentRound[];

        // Йуууухуууу, пирамидкаааа ^_^
        for (let indexStage = 0; indexStage < countStage; indexStage++) {
            for (let indexRoundInLine = 0; indexRoundInLine < 2**indexStage; indexRoundInLine++) {
                // Число уже сгенерированных раундов
                const currentRoundCount = grid.length + 1;

                const generatedRound: ITournamentRound = {
                    number_of_round: currentRoundCount,
                    games: [],
                    children_rounds: indexStage === countStage - 1
                        ? []
                        : [currentRoundCount * 2, currentRoundCount * 2 + 1],
                    parent_round: indexStage === 0
                        ? undefined
                        : currentRoundCount % 2 === 0
                            ? currentRoundCount / 2
                            : (currentRoundCount - 1) / 2,
                    players: indexStage !== countStage - 1
                        ? []
                        : [
                            {
                                user_id: memberList.pop(),
                                color: EPlayerColor.BLUE,
                                win_count: 0,
                            },
                            {
                                user_id: memberList.shift(),
                                color: EPlayerColor.RED,
                                win_count: 0,
                            },
                        ] as ITournamentPlayer[],
                    round_format: currentRoundCount === 1
                        ? tournament.super_final_format
                        : tournament.rounds_format
                };

                grid.push(generatedRound);
            }
        }

        return TournamentService.resolveInitialAutoWins(grid);
    }

    /**
     * Получение ИД турнира и номера раунда по совпадению списка игроков
     */
    public async getTournamentIdWithNumberOfRound(gameUserIdList: string[]): Promise<
        ITournamentIdWithNumberOfRound | null
    > {
        logger.info(
            'getTournamentIdWithNumberOfRound: Получение ИД турнира и номера раунда по совпадению списка игроков',
            { metadata: { gameUserIdList }}
        );

        const tournament = await TournamentModel.findOne(
            {
                started: true,
                users: { $all: gameUserIdList },
                winner_id: null,
            },
            { grid: true, name: true }
        );

        /**
         * Если не найден турнир с такими участниками
         */
        if (!tournament) {
            logger.warn(
                'getTournamentIdWithNumberOfRound: Не найден турнир с такими участниками',
                { metadata: { gameUserIdList }}
            );

            return null;
        }

        /**
         * Получение раундав котором участвуют
         */
        const round: ITournamentRound | null = tournament.grid.find(
            (_round: ITournamentRound) => (
                _round.players.length == 2
                && _round.players.every(
                (player: ITournamentPlayer) => gameUserIdList.includes(player.user_id)
                )
            )
        )

        /**
         * Если у переданных игроков нет активной встречи - тож бесцеремонно выкидываем
         */
        if (!round) {
            logger.warn(
                'getTournamentIdWithNumberOfRound: У игроков нет сейчас активной встречи',
                { metadata: { gameUserIdList }}
            );

            return null;
        }

        const tournamentIdWithNumberOfRound: ITournamentIdWithNumberOfRound = {
            number_of_round: round.number_of_round,
            tournament_id: tournament._id,
            tournament_name: tournament.name
        };

        logger.info(
            'getTournamentIdWithNumberOfRound: Высчитан турнир и раунд для переданных игроков',
            { metadata: { tournamentIdWithNumberOfRound } }
        );

        return tournamentIdWithNumberOfRound;
    }

    /**
     * Добавление результата игры к раунду в турнире
     */
    public async addGameToTournament(
        tournament_id: string, number_of_round: number, winner_id: string, game_id: string
    ) {
        logger.info(
            'addGameToTournament: Добавление результата игры к раунду в турнире',
            { metadata: { game_id, number_of_round, tournament_id, winner_id }}
        );

        const tournament: ITournament | null = await TournamentModel.findOne({ _id: tournament_id });

        if (!tournament) {
            logger.error(
                'addGameToTournament: Не найден турнир с таким ИД',
                { metadata: { tournament_id } }
            );

            throw new Error(`Не найден турнир с таким ИД: ${tournament_id}`);
        }

        const currentRound: ITournamentRound | null = tournament.grid.find(
            (round: ITournamentRound) => round.number_of_round === number_of_round
        );

        if (!currentRound) {
            logger.error(
                'addGameToTournament: Не найден активный раунд по номеру раунда',
                { metadata: { number_of_round } }
            );

            throw new Error(`Не найден активный раунд по номеру раунда: ${currentRound}, ${tournament}`);
        }

        /**
         * Текущие данные победившего игрока
         */
        const winnerGamePlayer = currentRound.players.find(
            (player: ITournamentPlayer) => player.user_id === winner_id
        );

        const newWinCount = winnerGamePlayer.win_count + 1;
        const isFinishGame = newWinCount >= mapRoundFormatToMaximumCountGame[currentRound.round_format];
        const needChangeGrid = isFinishGame && number_of_round !== 1;
        const targetRound: ITournamentRound = tournament.grid.find(
            round => round.number_of_round === number_of_round
        );

        const nextRound: ITournamentRound = tournament.grid.find(
            round => round.number_of_round === targetRound.parent_round
        );

        const mainDataQuery = getMainDataQuery(game_id, number_of_round, newWinCount, winner_id);
        const finishRoundDataQuery = getFinishRoundDataQuery(isFinishGame, winner_id, number_of_round);
        const changeGridDataQuery = getChangeGridDataQuery(
            needChangeGrid, nextRound.players.length, targetRound.parent_round, winner_id
        );

        const updatedValue = {
            $set: {
                ...mainDataQuery.update.$set,
                ...finishRoundDataQuery.update.$set,
            },
            $push: {
                ...mainDataQuery.update.$push,
                ...changeGridDataQuery.update.$push,
            }
        }

        const options = {
            arrayFilters: [
                ...mainDataQuery.options.arrayFilters,
                ...changeGridDataQuery.options.arrayFilters,
            ]
        }

        logger.info(
            'addGameToTournament: Сохранение результата игры в бд',
            { metadata: { tournament_id, updatedValue } }
        );

        await TournamentModel.updateOne(
            { _id: tournament_id },
            updatedValue,
            options
        );
    }

    /**
     * Создание турнира
     */
    public createTournament(tournamentData: ITournament) {
        return TournamentModel.create(tournamentData);
    }

    /**
     * Удаление турнира
     */
    public async deleteTournament(_id: string) {
        const deletedTour = await TournamentModel.findOneAndDelete({ _id });

        return deletedTour.toObject();
    }

    /**
     * Получение списка всех турниров
     */
    public async getAllTournaments() {
        const docs = await TournamentModel.find();

        return docs.map(doc => doc.toObject());
    }

    /**
     * Получение данных о турнире
     */
    public async getTournament(query: any): Promise<ITournament | null> {
        const tourDoc = await TournamentModel.findOne(query);

        if (!tourDoc) {
            return null;
        }

        // @ts-ignore
        return tourDoc.toObject();
    }

    /**
     * Добавление игрока в переданный турнир
     */
    public async addParticipantToTournament(tournament_id: string, user_id: string) {
        const updateOperator = {
            $push: { users: user_id }
        };

        await TournamentModel.findOneAndUpdate(
            { _id: tournament_id },
            updateOperator,
        );
    }

    /**
     * Удаление игрока из переданного турнира
     */
    public removeParticipantFromTournament(tournament_id: string, user_id: string) {
        const updateOperator = {
            $pull: { users: user_id }
        };

        return TournamentModel.findOneAndUpdate(
            { _id: tournament_id },
            updateOperator,
        );
    }

    /**
     * Проставление игроку технического поражения и продвижение его оппонента по сетке
     */
    public async setParticipantTechnicalLose(tournament_id: string, user_id: string) {
        logger.info(
            'setParticipantTechnicalLose: Проставление игроку технического поражения',
            { metadata: { tournament_id, user_id }
            }
        );

        const tournament: ITournament = await TournamentModel.findOne({ _id: tournament_id });

        const activeRound: ITournamentRound | null = tournament.grid.find(
            (round: ITournamentRound) => (
                round.players.find((player: ITournamentPlayer) => player.user_id === user_id)
                && isNil(round.winner_id)
            )
        )

        const winner: ITournamentPlayer | null = activeRound.players.find(
            (player: ITournamentPlayer) => player.user_id !== user_id
        );

        const nextRound: ITournamentRound = tournament.grid.find(
            round => round.number_of_round === activeRound.parent_round
        );

        const playerDataInNextRound: ITournamentPlayer = {
            color: nextRound.players.length === 0
                ? EPlayerColor.RED
                : EPlayerColor.BLUE,
            user_id: activeRound.winner_id,
            win_count: 0,
        }

        const updatedValue = {
            $set: {
                "grid.$[round].winner_id": winner.user_id,
                // Проставление победителя турнира, если это финальный раунд
                ...activeRound.number_of_round === 1
                    ? {winner_id: winner.user_id}
                    : {}
            },
            $push: {
                "grid.$[nextRound].players": playerDataInNextRound,
            }
        }

        const option = {
            arrayFilters: [
                {"round.number_of_round": activeRound.number_of_round},
                {"winner.user_id": winner.user_id},
                { "nextRound.number_of_round": activeRound.parent_round },
            ]
        }

        logger.info(
            'setParticipantTechnicalLose: Сохранение победителя текущего раунда и обновление сетки',
            { metadata: { updatedValue, option }
            }
        );

        await TournamentModel.updateOne(
            {_id: tournament_id},
            updatedValue,
            option
        );
    }

    /**
     * Стартовал ли переданный турнир
     */
    public async getIsStartedTournament(_id: string): Promise<boolean> {
        // @ts-ignore
        const tour: { started: boolean } | null = await TournamentModel.findOne(
            { _id },
            { started: true },
        );

        if (!tour) {
            return false;
        }

        return tour.started;

    }

    /**
     * Получением мапы названий турниров на их ID переданных турниров
     */
    public async getMapTournamentNameToIdByIdList(idList: string[]) {
        if (idList.length === 0) {
            return {};
        }

        const tournamentsDoc = await TournamentModel.find(
            { _id: { $in: idList } },
            { name: true },
        );

        // @ts-ignore
        const tournamentNameWithIdList: { _id: string; name: string }[] = tournamentsDoc.map(tourDoc => tourDoc.toObject());

        return tournamentNameWithIdList.reduce((acc, nameWithId) => ({
            ...acc,
            [nameWithId._id]: nameWithId.name,
        }), {});
    }
}