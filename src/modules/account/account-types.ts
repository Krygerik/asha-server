import { Document } from 'mongoose';
import {ERoles} from "../auth";

/**
 * Аккаунта пользователя, привязанный через дискорд
 */
export interface IAccount extends Document {
    banned: boolean; // Забанен ли аккаунт
    clientConnectId: string; // Ид для связи с клиентом АСХИ
    create_date: Date; // Дата создания аккаунта в АСХЕ
    discordId: string; // Ид дискорд аккаунта
    discriminator: string; // Дискорд тег пользователя
    merged_with_old_account: boolean; // Игрок произвел слияние со старым аккаунтом
    nickname?: string; // ник, устанавниваемый игроком
    original_rating?: number; // Рейтинг игрока, до создания АСХА
    rating: number; // Рейтинг игрока внутренний
    roles: ERoles[]; // Роли игрока
    tournaments: string[]; // ИД турниров, в которых юзверь участвовал или участвует
    username: string; // Никнейм пользователя из дискорд аккаунта
}

/**
 * Тело запроса на изменение никнейма
 */
export interface IUpdateNicknameInfoRequestBody {
    id?: string; // ид аккаунта
    nickname?: string; // новый никнейм
}

/**
 * Тип тела запроса на изменение данных пользователя
 */
export interface IUpdateAccountGameInfoRequestBody {
    id?: string; // ид игрока, которому изменяется профиль
    original_rating?: number; // рейтинг игрока, который был ранее
}

/**
 * Данные, переносимые из старого аккаунта в новый
 */
export interface IMergeAccountData {
    _id: string;
    nickname: string;
    original_rating: number;
    rating: number;
    roles: ERoles[];
    tournaments: string[];
}
