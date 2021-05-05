
/**
 * Тип данных пользователя, приходящий с ui
 */
export interface IUser {
    // почта пользователя, используется вместо логина
    email: string;
    // захешированный пароль
    hash_password: string;
}