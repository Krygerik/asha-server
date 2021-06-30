import {EPlayerColor} from "../game";
import {TournamentModel} from "./tournament-schema";
import {ITournament, ITournamentPlayer, ITournamentRound} from "./tournament-model";
import {
    AUTO_WIN,
    BOUNDARY_MEMBER_COUNT_LIST,
    mapCountMemberToCountStage,
    mapRoundFormatToMaximumCountGame,
} from "./tournament-constants";

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
        const FIVE_MINUTE = 6000;

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

            const grid = TournamentService.generateTournamentGrid(openTour);

            TournamentModel.findOneAndUpdate(
                { _id: openTour._id },
                {
                    $set: {
                        started: true,
                        grid,
                    }
                }
            ).catch((e) => console.log(e));
        })
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
    public async getTournamentIdWithNumberOfRound(gameUserIdList: string[]) {
        /**
         * Если игроков не 2, не обрабатываем
         */
        if (gameUserIdList.length !== 2) {
            return null;
        }

        const tournamentDoc = await TournamentModel.findOne(
            {
                started: true,
                users: { $all: gameUserIdList },
                winner_id: null,
            },
            { grid: true }
        );

        /**
         * Если не найден турнир с такими участниками
         */
        if (!tournamentDoc) {
            return null;
        }

        // @ts-ignore
        const tournament: ITournament | null = tournamentDoc.toObject();

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
            return null;
        }

        return {
            number_of_round: round.number_of_round,
            tournament_id: tournament._id,
        }
    }

    /**
     * Добавление результата игры к раунду в турнире
     */
    public async addGameToTournament(
        tournament_id: string, number_of_round: number, winner_id: string, game_id: string
    ) {
        // @ts-ignore
        const tournament: ITournament | null = await TournamentModel.findOne({ _id: tournament_id });

        if (!tournament) {
            throw new Error('Не удалось найти турнир, для добавления результатов игры');
        }

        const currentRound: ITournamentRound | null = tournament.grid.find(
            (round: ITournamentRound) => round.number_of_round === number_of_round
        );

        if (!currentRound) {
            throw new Error('Не удалось найти активный раунд турнира');
        }

        /**
         * Если игра игра уже добавлена в раунд - выкидываем
         */
        if (currentRound.games.includes(game_id)) {
            return null;
        }

        /**
         * Текущие данные победившего игрока
         */
        const winnerGamePlayer = currentRound.players.find(
            (player: ITournamentPlayer) => player.user_id === winner_id
        );

        const newWinCount = winnerGamePlayer.win_count + 1;
        const isFinishGame = newWinCount >= mapRoundFormatToMaximumCountGame[currentRound.round_format];

        const updatedValue = {
            $set: {
                "grid.$[round].players.$[winner].win_count": newWinCount,
                ...isFinishGame
                    ? {
                        "grid.$[round].winner_id": winner_id,
                        ...number_of_round === 1
                            ? { winner_id }
                            : {}
                    }
                    : {}
            },
            $push: {
                "grid.$[round].games": game_id,
            }
        }

        const option = {
            arrayFilters: [
                { "round.number_of_round": number_of_round },
                { "winner.user_id": winner_id },
            ]
        }

        const updatedTournament = await TournamentModel.updateOne(
            { _id: tournament_id },
            updatedValue,
            option
        );

        if (!updatedTournament) {
            throw new Error('Не удалось добавить результат игры в турнир');
        }

        /**
         * Если это последняя игра раунда и не суперфинал - двигаем игрока дальше по сетке
         */
        if (isFinishGame && number_of_round !== 1) {
            await this.moveWinnerIntoNextRound(tournament_id, number_of_round);
        }
    }

    /**
     * Перемещаем победителя в следующий раунд
     */
    public async moveWinnerIntoNextRound(tournament_id: string, number_of_round: number) {
        const tournamentDoc = await TournamentModel.findOne({ _id: tournament_id });

        // @ts-ignore
        const tournament: ITournament = tournamentDoc.toObject();

        const targetRound: ITournamentRound = tournament.grid.find(
            round => round.number_of_round === number_of_round
        );

        const nextRound: ITournamentRound = tournament.grid.find(
            round => round.number_of_round === targetRound.parent_round
        );

        const playerDataInNextRound: ITournamentPlayer = {
            color: nextRound.players.length === 0
                ? EPlayerColor.RED
                : EPlayerColor.BLUE,
            user_id: targetRound.winner_id,
            win_count: 0,
        }

        const updatedValue = {
            $push: {
                "grid.$[nextRound].players": playerDataInNextRound,
            }
        };

        const option = {
            arrayFilters: [
                { "nextRound.number_of_round": targetRound.parent_round },
            ]
        }

        const updatedTournament = await TournamentModel.updateOne(
            { _id: tournament_id },
            updatedValue,
            option
        );

        if (!updatedTournament) {
            throw new Error('Не удалось переместить победителя в следующий раунд турнира');
        }
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
        const docs = await TournamentModel.find().select('-__v');

        return docs.map(doc => doc.toObject());
    }

    /**
     * Получение данных о турнире
     */
    public getTournament(query: any) {
        return TournamentModel.findOne(query).select('-__v');
    }

    /**
     * Получение списка участников турнира
     */
    public async getParticipantListByTournamentId(_id: string) {
        const tournament = await TournamentModel.findOne({ _id });

        // @ts-ignore
        return tournament.toObject().users;
    }

    /**
     * Добавление игрока в переданный турнир
     */
    public addParticipantToTournament(tournament_id: string, user_id: string) {
        const updateOperator = {
            $push: { users: user_id }
        };

        return TournamentModel.findOneAndUpdate(
            {
                _id: tournament_id,
                started: false,
            },
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
}