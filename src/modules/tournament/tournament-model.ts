import {Document} from 'mongoose';
import {EPlayerColor} from "../game";

/**
 * Данные по участнику раунда
 */
export interface ITournamentPlayer {
    color?: EPlayerColor;   // Цвет игрока
    user_id?: string;       // ИД игрока
    win_count: number;      // Количество побед
}

/**
 * Турнирная встреча
 */
export interface ITournamentRound {
    children_rounds: number[];      // Номера дочерних раундов
    games: string[];                // ИД игр, сыгранных в этом раунде
    number_of_round: number;        // Номер этого раунда
    parent_round?: number;          // Номер родительского раунда
    players: ITournamentPlayer[];   // Данные игроков текущего раунда
    round_format: ERoundFormat;     // Формат этого раунда
    winner_id?: string;             // Ид игрока победителя в текущем раунде
}

/**
 * Возможные форматы раундов
 */
export enum ERoundFormat {
    Bo3 = 'Bo3', // До 2 побед
    Bo5 = 'Bo5', // До 3 побед
}

/**
 * Тип данных о турнире
 */
export interface ITournament extends Document {
    grid: ITournamentRound[];           // Список всех раундов турнира (Сетка)
    maximum_player_count: number;       // Максимальное количество участников турнира
    name: string;                       // Название турнира
    rounds_format: ERoundFormat;        // Формат прочих раундов
    start_date: string;                 // Дата начала турнира
    started: boolean;                   // Регистрация окончилась и турнир начался
    super_final_format: ERoundFormat;   // Формат суперфинала
    users: string[];                    // Список пользователей, зарегистрированных в турнире
    winner_id?: string;                 // ИД победителя турнира
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

export interface ITournamentIdWithNumberOfRound {
    number_of_round: number;
    tournament_id: string;
    tournament_name: string;
}
