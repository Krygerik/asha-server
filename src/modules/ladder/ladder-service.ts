import {LadderModel} from "./ladder-schema";
import { ILadderRecord } from "./ladder-type";

export class LadderService {
    /**
     * Создание записи ладдера
     */
    public createLadder(ladderData: ILadderRecord) {
        return LadderModel.create(ladderData);
    }

    /**
     * Получение записи ладдера по участнику
     */
    public async getActiveLadderByUserId(userId: string) {
        const ladderDoc = await LadderModel.findOne({ member_ids: userId, active: true });

        if (!ladderDoc) {
            return null;
        }

        return ladderDoc.toObject();
    }

    /**
     * Закрывает ладдерную встречу
     */
    public closeLadderRound(_id: string) {
        LadderModel.findOneAndUpdate({ _id }, { $set: { active: false } });
    }

    /**
     * Добавление ИД игры в запись турнирной встречи
     */
    public addGameToLadder(_id: string, gameId: string) {
        LadderModel.findOneAndUpdate({ _id }, { $push: { game_ids: gameId} })
    }
}