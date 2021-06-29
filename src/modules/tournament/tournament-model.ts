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
    // ИД игр, сыгранных в этом раунде
    games: string[];
    // Номер этого раунда
    number_of_round: number;
    // Номер родительского раунда
    parent_round?: number;
    // Данные игроков текущего раунда
    players: ITournamentPlayer[];
    // Формат этого раунда
    round_format: ERoundFormat;
    // Ид игрока победителя в текущем раунде
    winner_id?: string;
}

/**
 * Возможные форматы раундов
 */
export enum ERoundFormat {
    // До 2 побед
    Bo3 = 'BO3',
    // До 3 побед
    Bo5 = 'BO5',
}

/**
 * Тип данных о турнире
 */
export interface ITournament {
    // ИД записи в бд
    _id: string;
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
    // Формат прочих раундов
    rounds_format: ERoundFormat;
    // Формат суперфинала
    super_final_format: ERoundFormat;
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
