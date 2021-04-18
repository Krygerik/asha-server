/**
 * Цвет игрока
 */
export enum EPlayerColor {
    RED = 1,
    BLUE = 2,
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
    start_bonus: string;
}

export interface ISavedPlayer extends IInputPlayer {
    // id в mongodb
    _id: string;
    // Никнейм игрока
    nickname: string;
    // Признак, является ли игрок победителем
    winner: boolean | undefined;
}

/**
 * Тип входящих данных по основным характеристикам игроков с ником отправителя
 */
export interface IInputPlayersData {
    // id сражения
    combat_id: number;
    // Никнейм игрока
    nickname: string;
    // Список данных о прокачках обоих игроков
    players: IInputPlayer[];
}

/**
 * Тип данных для сохранения данных об игре
 */
export interface IInputGameData {
    // id сражения
    combat_id: number;
    // Список ников игроков, участвующих в игре
    players_nicknames: string[];
    // Список данных о прокачках обоих игроков
    players: IInputPlayer[];
}

export interface ISavedGame extends IInputGameData{
    // id в mongodb
    _id: string;
    // Дата окончания игры
    date?: string;
    // Список данных обоих игроков
    players: ISavedPlayer[];
    // Цвет победителя
    winner: EPlayerColor;
}

interface IShortPlayer {
    // Цвет игрока
    color: EPlayerColor;
    // Название героя
    hero: string;
    // Никнейм игрока
    nickname: string;
    // Раса
    race: string;
    // Признак, является ли игрок победителем
    winner: boolean | undefined;
}

export interface IShortGame {
    // id в mongodb
    _id: string;
    // id сражения
    combat_id: number;
    // Дата окончания игры
    date?: string;
    // Список данных обоих игроков
    players: IShortPlayer[];
}
