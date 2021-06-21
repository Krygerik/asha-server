import {EPlayerColor} from "../game";

/**
 * Данные по участнику раунда
 */
export interface ITournamentPlayer {
    // ИД игрока
    user_id?: string;
    // Цвет игрока
    color?: EPlayerColor;
    // Количество побед
    win_count: number;
}

/**
 * Турнирная встреча
 */
export interface ITournamentRound {
    // Номера дочерних раундов
    children_rounds: number[];
    // Номер родительского раунда
    parent_round?: number;
    // Номер этого раунда
    number_of_round: number;
    // Данные игроков текущего раунда
    players: ITournamentPlayer[];
    // Ид игрока победителя в текущем раунде
    winner_id?: string;
}

/**
 * Тип данных о турнире
 */
export interface ITournament {
    // Дата начала турнира
    start_date: string;
    // Список пользователей, зарегистрированных в турнире
    users: string[];
    // Название турнира
    name: string;
    // Регистрация окончилась и турнир начался
    started: boolean;
    // Список всех раундов турнира (Сетка)
    grid: ITournamentRound[];
}

/**
 * Тело запроса на регистрацию игрока в турнире
 */
export interface IRegisterParticipantBody {
    // ИД турнира
    tournament_id: string | undefined;
    // ИД регистрирующегося игрока
    userId: string;
}
