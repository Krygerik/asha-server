import { Document } from 'mongoose';
import { IMapType, IMapVersionValue } from "../map-version";

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
    count: number;  // Количество
    name: string;   // Название (ид)
}

/**
 * Интерфейс игрока в записи боя
 */
export interface IInputPlayer extends Document {
    army: ICreatures[];                 // Список войск героя
    arts: string[];                     // Артефакты героя
    attack: number;                     // Нападение героя
    color: EPlayerColor;                // цвет игрока
    defence: number;                    // Защита героя
    hero: string;                       // Название героя
    knowledge: number;                  // Знание героя
    level: number;                      // Уровень героя
    luck: number;                       // Удача героя
    mana_start: number;                 // Стартовая мана героя
    mentoring: number;                  // Количество использования ментора
    morale: number;                     // Мораль героя
    perks: string[];                    // Умения, способности
    race: string;                       // Раса
    skills: string[];                   // Школы героя
    spell_power: number;                // Колдовство героя
    spells: string[];                   // Заклинания героя
    start_bonus: EPlayerStartedBonus;   // Выбранный стартовый бонус
    war_machines: string[];             // Боевые машины игрока
}

export interface ISavedPlayer extends IInputPlayer {
    army_remainder?: ICreatures[];  // Конечный состав армии
    changed_rating?: number;        // На сколько изменился рейтинг игрока за эту партию
    new_rating?: number;            // Новый рейтинг игрока после игры
    user_id?: string;               // Ид пользователя в бд
    winner: boolean;                // Является ли игрок победителем
}

/**
 * Тип входящих данных по основным характеристикам игроков с ником отправителя
 */
export interface ISaveGameParamsBody {
    combat_id: string;              // id сражения
    map_type: IMapType;             // Тип карты
    map_version: IMapVersionValue;  // Версия карты
    players: ISavedPlayer[];        // Список данных о прокачках обоих игроков
    userId: string;                 // id пользователя из монго
}

/**
 * Тип входящих данных с данными о победителе
 */
export interface IWinnerRequestDto {
    army_remainder: ICreatures[];       // Конечный состав армии
    combat_id: string;                  // id сражения
    date: string;                       // Дата окончания игры
    isRedPlayer: boolean;               // Является ли игрок красным
    percentage_of_army_left: number;    // Процент оставшейся силы армии
    userId: string;                     // id пользователя из монго
    wasDisconnect?: boolean;            // Произошел ли разрыв соединения во время игры
    winner: EPlayerColor;               // Цвет игрока победителя
}

/**
 * Тело запроса для установки статуса соединения для игры
 */
export interface ISetDisconnectStatusDto {
    IsDisconnect?: boolean; // статус соединения
    combat_id?: string;     // ИД игры для которой проставляется статус
    userId: string;         // id пользователя из монго
}

/**
 * Тип данных для сохранения данных об игре
 */
export interface IInputGameData extends Document {
    combat_id: string;              // id сражения
    map_type: IMapType;             // Версия карты
    map_version: IMapVersionValue;  // Версия карты
    players: IInputPlayer[];        // Список данных о прокачках обоих игроков
    players_ids: string[];          // Список ников игроков, участвующих в игре
}

/**
 * Тип информации об игре из бд
 */
export interface ISavedGame extends IInputGameData {
    date: string;                               // Дата окончания игры
    disconnect: boolean;                        // Произошел ли разрыв соединения
    disconnect_confirmed: boolean;              // Подтверждение дисконнекта пришло раньше чем началось его ожидание
    ladder_id?: string;                         // ИД рейтинговой встречи
    number_of_round?: number;                   // Номер раунда в турнире
    players: ISavedPlayer[];                    // Список данных обоих игроков
    players_ids: string[];                      // Список ников игроков, участвующих в игре
    tournament_id?: string;                     // ИД турнира, в рамках которого была сыграна игра
    tournament_name?: string;                   // Название турнира, в рамках которого была сыграна игра
    waiting_for_disconnect_status: boolean;     // Ожидание статуса соединения
    winner?: EPlayerColor;                      // Цвет победителя
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
    // Версия карты
    map_version?: IMapVersionValue;
    // Данные по игрокам
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
