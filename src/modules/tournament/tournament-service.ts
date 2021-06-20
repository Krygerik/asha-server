import {TournamentModel} from "./tournament-schema";
import {ITournament} from "./tournament-model";

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
            TournamentModel.updateMany(
                {
                    start_date: { $lt: new Date().toISOString() },
                    started: false,
                },
                { started: true }
            )
        }, FIVE_MINUTE);
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