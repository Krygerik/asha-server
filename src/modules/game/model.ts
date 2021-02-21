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
    // Список оставшихся войск героя
    army_remainder?: ICreatures[];
    // Артефакты героя
    arts: string[];
    // Нападение героя
    attack: number;
    // цвет игрока
    color: EPlayerColor[];
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
    // Конечная мана героя
    mana_end: number;
    // Стартовая мана героя
    mana_start: number;
    // Количество использования ментора
    mentoring: number;
    // Мораль героя
    morale: number;
    // Никнейм игрока
    nickname?: string;
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
    // Ходов осталось
    turns_left: number;
}

export interface ISavedPlayer extends IInputPlayer {
    // id в mongodb
    _id: string;
    // Никнейм игрока
    nickname: string;
}

export interface IInputGameData {
    // id сражения
    combat_id: number;
    // Дата окончания игры
    date: string;
    // Данные проигравшего игрока
    loosing_player: IInputPlayer;
    // Данные победившего игрока
    winning_player: IInputPlayer;
}

export interface ISavedGame extends IInputGameData{
    // id в mongodb
    _id: string;
    // Данные проигравшего игрока
    loosing_player: ISavedPlayer;
    // Данные победившего игрока
    winning_player: ISavedPlayer;
}

interface IShortPlayer {
    // Цвет игрока
    color: EPlayerColor[];
    // Название героя
    hero: string;
    // Никнейм игрока
    nickname: string;
    // Раса
    race: string;
}

export interface IShortGame {
    // id в mongodb
    _id: string;
    // id сражения
    combat_id: number;
    // Дата окончания игры
    date: string;
    // Данные проигравшего игрока
    loosing_player: IShortPlayer;
    // Данные победившего игрока
    winning_player: IShortPlayer;
}
