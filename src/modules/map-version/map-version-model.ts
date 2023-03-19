
export type IMapVersionValue = string

/**
 * Перечисление всех возможных значений версий карты
 */
export interface IMapVersionTypeValue = {
    // Тип карты (rta, hrta)
    type: string;
    // Значение карты, передаваемое из игры
    version: IMapVersionValue;
}

/**
 * Запись версии карты в бд
 */
export interface IMapVersionRecord {
    // id в монго
    _id: string;
    // Тип карты (rta, hrta)
    value: IMapVersionTypeValue;
    // Родитель
    parent: IMapVersionTypeValue
}