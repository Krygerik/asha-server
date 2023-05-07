
/**
 * Тип локализации записей
 */
export interface ILocalization {
    en: string;
    ru: string;
}

/**
 * Тип одиночной записи в справочнике
 */
export interface IRecords {
    // id записи в БД
    _id: string;
    // id объекта
    game_id: string;
    // Локализованное (русское) название записи
    localize_name: ILocalization | string;
}
