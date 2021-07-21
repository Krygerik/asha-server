import {ELogLevel} from "./client-logs-enums";

/**
 * Тип записи лога
 */
export interface IClientLogs {
    // Данные, переданные в логе
    data?: string;
    // Дата создания лога
    date?: string;
    // Уровень лога
    level?: ELogLevel;
    // Сообщение для лога
    message?: string;
    // Пользователь, которому принадлежит лог
    user_id?: string;
}