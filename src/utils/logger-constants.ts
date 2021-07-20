import * as cls from "cls-hooked";

/**
 * Ключ, под которых хранится уникальный ИД для каждого пространства имен
 */
export const TREAD_ID_FIELD_NAME = 'treadId';

/**
 * Ключ, под которых хранится уникальный ИД для каждой игры
 */
export const COMBAT_ID_FIELD_NAME = 'combat_id';

/**
 * Ключ, под которых хранится уникальный ИД пользователя
 */
export const USER_ID_FIELD_NAME = 'userId';

export const clsNamespace = cls.createNamespace('hrta-server-namespace');
