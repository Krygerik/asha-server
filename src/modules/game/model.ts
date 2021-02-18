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
export interface IPlayer {
    // id в mongodb
    _id?: string;
    // Список войск героя
    army: ICreatures[];
    // Список оставшихся войск героя
    army_remainder?: ICreatures[];
    // Артефакты героя
    arts: string[];
    // Нападение героя
    attack: number;
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

export interface IGame {
    // id в mongodb
    _id?: string;
    // id сражения
    combat_id: string;
    // Дата окончания игры
    date: string;
    // Данные проигравшего игрока
    loosing_player: IPlayer;
    // Данные победившего игрока
    winning_player: IPlayer;
}
