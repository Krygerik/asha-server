
/**
 * Тип ролей пользователя
 */
export enum ERoles {
    ADMIN = 'ADMIN',
}

/**
 * Тип данных пользователя, приходящий с ui
 */
export interface IUser {
    // номер дискорда
    discord: string;
    // почта пользователя, используется вместо логина
    email: string;
    // захешированный пароль
    hash_password: string;
    // ник игрока
    nickname: string;
    // Рейтинг игрока, до создания АСХА
    original_rating: string;
    // Рейтинг игрока
    rating?: number;
    // Роли игрока
    roles: ERoles[];
    // ИД турниров, в которых юзверь участвовал или участвует
    tournaments: string[];
}

/**
 * Тип данных пользователя, сохраненных в бд
 */
export interface ISavedUser extends IUser {
    // Уникальный ИД записи, выданный mongo
    _id: string;
    // Рейтинг игрока
    rating: number;
}

/**
 * Тип тела запроса на изменение данных пользователя
 */
export interface IUpdateUserInfoRequestBody {
    // новый дискорд
    discord?: string;
    // новый никнейм
    nickname?: string;
    // ид игрока, которому изменяется профиль
    id?: string;
}

/**
 * Тип тела запроса на изменение данных пользователя
 */
export interface IUpdateUserGameInfoRequestBody {
    // ид игрока, которому изменяется профиль
    id?: string;
    // рейтинг игрока, который был ранее
    original_rating?: number;
}
