import {MappingNicknameToGameModel} from "./schema";
import {IMappingNicknameToGame} from "./model";
import {DEFAULT_COUNT_FIND_GAMES_BY_NICKNAME, MAXIMUM_GAME_PLAYERS_COUNT} from "./constants";

export class MappingNicknameToGameService {
    public createEntity(entityParams: IMappingNicknameToGame, callback: any) {
        const session = new MappingNicknameToGameModel(entityParams);

        session.save(callback);
    }

    /**
     * Получение списка никнеймов, связанных с переданным CombatId
     */
    public findNicknameListByCombatId(combatId: number, callback: any) {
        MappingNicknameToGameModel.find({ combat_id: combatId }, callback);
    }

    /**
     * Проверка на существование записи в БД
     */
    public async checkingARecordForExisting(record: IMappingNicknameToGame): Promise<boolean> {
        return await MappingNicknameToGameModel.exists(record);
    }

    /**
     * Проверка на наличие максимума записей, связанных с текущей игрой
     */
    public async checkThatGameContainsMaximumEntries(combatId: number): Promise<boolean> {
        const docList = await MappingNicknameToGameModel.find({ combat_id: combatId });

        return docList.length >= MAXIMUM_GAME_PLAYERS_COUNT;
    }

    /**
     * Получение всех игр, связанных с передаваемым игроком
     */
    public async getGamesByNickname(nickname: string): Promise<number[]> {
        // @ts-ignore
        const docList: IMappingNicknameToGame[] = await MappingNicknameToGameModel.find({ nickname });

        return docList
            .map((entry) => entry.combat_id)
            .reverse()
            .slice(
                0,
                DEFAULT_COUNT_FIND_GAMES_BY_NICKNAME
            );
    }
}
