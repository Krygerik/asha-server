/**
 * Тип одиночной записи в справочнике
 */
interface IRecords {
    // id записи в БД
    _id: string;
    // id записи в игре
    game_id: string;
    // Локализованное (русское) название записи
    localize_name: string;
}

/**
 * Тип справочника
 */
export interface IDictionary {
    // id записи в БД
    _id: string;
    // Название справочника
    name: string;
    // Список записей справочника
    records: IRecords[];
}