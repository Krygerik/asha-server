import {Document} from 'mongoose';
import {EPlayerColor} from "../game";

/**
 * Данные по участнику раунда
 */
export interface ITournamentPlayer {
    // Цвет игрока
    color?: EPlayerColor;
    // ИД игрока
    user_id?: string;
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
    Bo3 = 'Bo3',
    // До 3 побед
    Bo5 = 'Bo5',
}

/**
 * Тип данных о турнире
 */
export interface ITournament extends Document {
    // ИД записи в бд
    _id: string;
    // Список всех раундов турнира (Сетка)
    grid: ITournamentRound[];
    // Максимальное количество участников турнира
    maximum_player_count: number;
    // Название турнира
    name: string;
    // Формат прочих раундов
    rounds_format: ERoundFormat;
    // Список пользователей, зарегистрированных в турнире
    users: string[];
    // Регистрация окончилась и турнир начался
    started: boolean;
    // Дата начала турнира
    start_date: string;
    // Формат суперфинала
    super_final_format: ERoundFormat;
    // ИД победителя турнира
    winner_id?: string;
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
