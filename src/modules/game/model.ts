import { EMapVersionValues } from "../map-version";

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
    // На сколько изменился рейтинг игрока за эту партию
    changed_rating?: number;
    // Новый рейтинг игрока после игры
    new_rating?: number;
    // Является ли игрок победителем
    winner: boolean;
}

/**
 * Тип входящих данных по основным характеристикам игроков с ником отправителя
 */
export interface ISaveGameParamsBody {
    // id сражения
    combat_id: string;
    // Версия карты
    map_version: EMapVersionValues;
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
    combat_id: string;
    // Дата окончания игры
    date: string;
    // Является ли игрок красным
    isRedPlayer: boolean;
    // id игрока
    user_id: string;
    // Процент оставшейся силы армии
    percentage_of_army_left: number;
    // Произошел ли разрыв соединения во время игры
    wasDisconnect?: boolean;
    // Цвет игрока победителя
    winner: EPlayerColor;
}

/**
 * Тело запроса для установки статуса соединения для игры
 */
export interface ISetDisconnectStatusDto {
    // ИД игры для которой проставляется статус
    combat_id?: string;
    // статус соединения
    IsDisconnect?: boolean;
}

/**
 * Тип данных для сохранения данных об игре
 */
export interface IInputGameData {
    // id сражения
    combat_id: string;
    // Версия карты
    map_version: EMapVersionValues;
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
    disconnect?: boolean;
    // ИД рейтинговой встречи
    ladder_id?: string;
    // Номер раунда в турнире
    number_of_round?: number;
    // Список данных обоих игроков
    players: ISavedPlayer[];
    // Список ников игроков, участвующих в игре
    players_ids: string[];
    // ИД турнира, в рамках которого была сыграна игра
    tournament_id?: string;
    // Название турнира, в рамках которого была сыграна игра
    tournament_name?: string;
    // Ожидание статуса соединения
    waiting_for_disconnect_status?: boolean;
    // Цвет победителя
    winner?: EPlayerColor;
}

/**
 * Тип краткой информации по игроку
 */
export interface IShortPlayer {
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
 * Ключи сравнений для бд
 */
export enum EComparisonNames {
    Equal = '$eq',
    GreatThen = '$gt',
    LessThen = '$lt',
}

export type TComparisonField = Record<EComparisonNames, number>;

export interface IShortPlayerFilterInfo {
    // ID героя
    hero?: string;
    // ID фракции
    race?: string;
    // ID игрока
    user_id?: string;
}

/**
 * Краткий фильтр игр
 */
export interface IShortFilter {
    players: IShortPlayerFilterInfo[];
}

/**
 * Поля фильтра для игроков
 */
interface IFilterPlayersField {
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
    // Количество ментора
    mentoring?: TComparisonField;
    // Нападение героя
    attack?: TComparisonField;
    // Защита героя
    defence?: TComparisonField;
    // Колдовство героя
    spell_power?: TComparisonField;
    // Знание героя
    knowledge?: TComparisonField;
    // Удача героя
    luck?: TComparisonField;
    // Мораль героя
    morale?: TComparisonField;
    // Уровень героя
    level?: TComparisonField;
    // Стартовая мана героя
    mana_start?: TComparisonField;
    // Один из навыков героя
    perks?: string;
    // Один артефакт героя
    arts?: string;
    // Одно из заклинаний героя
    spells?: string;
    // Существо из армии героя
    "army.name"?: string;
    // Боевая машина игрока
    war_machines?: string;
    // Является ли текущий фильтр главным
    main?: boolean;
}

/**
 * Фильтр по статистике игр
 */
export interface IFilterGames {
    players: IFilterPlayersField[];
    // Количество оставшейся армии
    percentage_of_army_left?: TComparisonField;
}

/**
 * Тип обрезанной игры для подсчетов винрейта
 */
export type TCutGames = {
    // Ид игры в БД
    _id: string;
    // Краткие данные по игрокам
    players: {
        // Цвет игрока
        color: number;
        // Раса игрока
        race: string;
        // Является ли игрок победителем
        winner: boolean;
    }[]
};

/**
 * Тип винрейта
 */
export type TWinRate = {
    // Количество поражений
    loses: number;
    // Количество побед
    wins: number;
};
