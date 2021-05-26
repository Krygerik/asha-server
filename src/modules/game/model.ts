/**
 * Цвет игрока
 */
export enum EPlayerColor {
    RED = 1,
    BLUE = 2,
}

/**
 * Стартовый бонус игрока
 */
export enum EPlayerStartedBonus {
    Artifact = 'art',
    Gold = 'gold',
    Spell = 'spell',
}

/**
 * Интерфейс однотипных войск
 */
interface ICreatures {
    // Количество
    count: number;
    // Название
    name: string;
}

/**
 * Интерфейс игрока в записи боя
 */
export interface IInputPlayer {
    // Список войск героя
    army: ICreatures[];
    // Артефакты героя
    arts: string[];
    // Нападение героя
    attack: number;
    // цвет игрока
    color: EPlayerColor;
    // Защита героя
    defence: number;
    // Название героя
    hero: string;
    // Знание героя
    knowledge: number;
    // Уровень героя
    level: number;
    // Удача героя
    luck: number;
    // Стартовая мана героя
    mana_start: number;
    // Количество использования ментора
    mentoring: number;
    // Мораль героя
    morale: number;
    // Умения, способности
    perks: string[];
    // Раса
    race: string;
    // Школы героя
    skills: string[];
    // Колдовство героя
    spell_power: number;
    // Заклинания героя
    spells: string[];
    // Выбранный стартовый бонус
    start_bonus: EPlayerStartedBonus;
    // Боевые машины игрока
    war_machines: string[];
}

export interface ISavedPlayer extends IInputPlayer {
    // id в mongodb
    _id: string;
    // Конечный состав армии
    army_remainder?: ICreatures[];
    // Ид пользователя в бд
    user_id?: string;
}

/**
 * Тип входящих данных по основным характеристикам игроков с ником отправителя
 */
export interface IInputPlayersData {
    // id сражения
    combat_id: number;
    // Версия карты
    map_version: string;
    // id игрока
    user_id: string;
    // Список данных о прокачках обоих игроков
    players: IInputPlayer[];
}

/**
 * Тип входящих данных с данными о победителе
 */
export interface IWinnerRequestDto {
    // Конечный состав армии
    army_remainder: ICreatures[];
    // id сражения
    combat_id: number;
    // Дата окончания игры
    date: string;
    // Является ли игрок красным
    isRedPlayer: boolean;
    // id игрока
    user_id: string;
    // Процент оставшейся силы армии
    percentage_of_army_left: number;
    // Цвет игрока победителя
    winner: EPlayerColor;
}

/**
 * Тип данных для сохранения данных об игре
 */
export interface IInputGameData {
    // id сражения
    combat_id: number;
    // Версия карты
    map_version: string;
    // Список ников игроков, участвующих в игре
    players_ids: string[];
    // Список данных о прокачках обоих игроков
    players: IInputPlayer[];
}

/**
 * Тип информации об игре из бд
 */
export interface ISavedGame extends IInputGameData {
    // id в mongodb
    _id: string;
    // Дата окончания игры
    date?: string;
    // Произошел ли разрыв соединения
    disconnect: boolean;
    // Список данных обоих игроков
    players: ISavedPlayer[];
    // Список ников игроков, участвующих в игре
    players_ids: string[];
    // Цвет победителя
    winner?: EPlayerColor;
}

/**
 * Тип краткой информации по игроку
 */
export interface IShortPlayer {
    // Конечный состав армии
    army_remainder?: ICreatures[];
    // Цвет игрока
    color: EPlayerColor;
    // Название героя
    hero: string;
    // Раса
    race: string;
    // Ид пользователя в бд
    user_id: string;
}

/**
 * Тип краткой информации по игре
 */
export interface IShortGame {
    // id в mongodb
    _id: string;
    // id сражения
    combat_id: number;
    // Дата окончания игры
    date?: string;
    // Произошел ли разрыв соединения
    disconnect: boolean;
    // Список данных обоих игроков
    players: IShortPlayer[];
    // Цвет победителя
    winner: EPlayerColor;
}

/**
 * Опции для поиска игр с пагинацией
 */
export interface IFindGameOptions {
    // Количество запрашиваемых элементов
    items: number;
    // Страница запрашиваемых элементов
    requestPage: number;
}

/**
 * Опции фильтрации игр при поиске
 */
export interface IFilterGamesOption {
    // Цвет игрока
    color?: EPlayerColor;
    // ID героя
    hero?: string;
    // ID фракции
    race?: string;
    // ID игрока
    user_id?: string;
    // Стартовый бонус игрока
    start_bonus?: EPlayerStartedBonus;
}
