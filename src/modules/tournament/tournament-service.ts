import {TournamentModel} from "./tournament-schema";
import {ITournament} from "./tournament-model";

/**
 * Действия непосредственно с таблицей с турнирами
 */
export class TournamentService {
    /**
     * Создание турнира
     */
    public createTournament(tournamentData: ITournament) {
        return TournamentModel.create(tournamentData);
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
}