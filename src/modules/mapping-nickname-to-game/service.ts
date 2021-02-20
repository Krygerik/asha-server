import {MappingNicknameToGameModel} from "./schema";
import {IMappingNicknameToGame} from "./model";
import {MAXIMUM_GAME_PLAYERS_COUNT} from "./constants";

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
}
