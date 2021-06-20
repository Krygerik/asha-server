
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
