
/**
 * Тип данных пользователя, приходящий с ui
 */
export interface IUser {
    // почта пользователя, используется вместо логина
    email: string;
    // захешированный пароль
    hash_password: string;
}

/**
 * Тип данных пользователя, сохраненных в бд
 */
export interface ISavedUser extends IUser {
    // Уникальный ИД записи, выданный mongo
    _id: string;
}
