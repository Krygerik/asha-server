import {MappingNicknameToGameModel} from "./schema";
import {IMappingNicknameToGame} from "./model";

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
}
