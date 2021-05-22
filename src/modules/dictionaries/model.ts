/**
 * Тип одиночной записи в справочнике
 */
export interface IRecords {
    // id записи в БД
    _id: string;
    // id записи в игре
    game_id: string;
    // Локализованное (русское) название записи
    localize_name: string;
}

/**
 * Список всех словарей
 */
export enum EDictionaryName {
    Artifacts = 'artifacts',
    Creatures = 'creatures',
    Heroes = 'heroes',
    Perks = 'perks',
    Races = 'races',
    Skills = 'skills',
    Spells = 'spells',
    WarMachines = 'warMachines',
}

/**
 * Тип справочника
 */
export interface IDictionary {
    // id записи в БД
    _id: string;
    // Название справочника
    name: EDictionaryName;
    // Список записей справочника
    records: IRecords[];
}
