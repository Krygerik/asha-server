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
}