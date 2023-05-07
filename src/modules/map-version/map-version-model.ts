
export type IMapVersionValue = string
export type IMapType = 'RTA' | 'HRTA';

/**
 * Перечисление всех возможных значений версий карты
 */
export interface IMapVersionTypeValue {
    // Тип карты
    type: IMapType;
    // Значение карты, передаваемое из игры
    version: IMapVersionValue;
}

/**
 * Запись версии карты в бд
 */
export interface IMapVersionRecord {
    // id в монго
    _id: string;
    // Тип карты
    value: IMapVersionTypeValue;
    // Родитель
    parent: IMapVersionTypeValue
}