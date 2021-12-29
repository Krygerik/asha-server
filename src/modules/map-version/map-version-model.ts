
/**
 * Перечисление всех возможных значений версий карты
 */
export type IMapVersionValue = string;

/**
 * Запись версии карты в бд
 */
export interface IMapVersionRecord {
    // id в монго
    _id: string;
    // Значение карты, передаваемое из игры
    value: IMapVersionValue;
}