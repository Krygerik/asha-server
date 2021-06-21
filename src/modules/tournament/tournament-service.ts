import {EPlayerColor} from "../game";
import {TournamentModel} from "./tournament-schema";
import {ITournament, ITournamentPlayer, ITournamentRound} from "./tournament-model";

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
            this.closeRegistrationInOpenTournaments();
        }, FIVE_MINUTE);

    }

    /**
     * Закрытие регистраций на турниры, в которых время на регистрацию истекло
     */
    private async closeRegistrationInOpenTournaments() {
        // @ts-ignore
        const openToursDocs: { _id: string, users: string[] }[] = await TournamentModel.find(
            {
                start_date: { $lt: new Date().toISOString() },
                started: false,
            },
            { _id: true, users: true }
        );

        openToursDocs.forEach(openTours => {
            const grid = this.generateTournamentGrid(openTours.users);

            TournamentModel.findOneAndUpdate(
                { _id: openTours._id },
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
     * Создание турнирной сетки
     */
    private generateTournamentGrid(users: string[]): ITournamentRound[] {
        const mapCountUsersToCountStage = {
            [2]: 1,
            [4]: 2,
            [8]: 3,
            [16]: 4,
            [32]: 5,
            [64]: 6,
        };
        const countStage = mapCountUsersToCountStage[users.length];

        const grid = [] as ITournamentRound[];

        // Йуууухуууу, пирамидкаааа ^_^
        for (let indexStage = 0; indexStage < countStage; indexStage++) {
            for (let indexRoundInLine = 0; indexRoundInLine < 2**indexStage; indexRoundInLine++) {
                // Число уже сгенерированных раундов
                const currentRoundCount = grid.length + 1;

                const generatedRound: ITournamentRound = {
                    number_of_round: currentRoundCount,
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
                                user_id: users.pop(),
                                color: EPlayerColor.BLUE,
                                win_count: 0,
                            },
                            {
                                user_id: users.shift(),
                                color: EPlayerColor.RED,
                                win_count: 0,
                            },
                        ] as ITournamentPlayer[]
                };

                grid.push(generatedRound);
            }
        }

        return grid;
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