import {LadderModel} from "./ladder-schema";
import { ILadderRecord } from "./ladder-type";

export class LadderService {
    /**
     * Создание записи ладдера
     */
    public async createLadder(ladderData: any) {
        await LadderModel.updateMany(
            {
                member_ids: {
                    $in: ladderData.member_ids
                }
            },
            {
                $set: {
                    active: false
                }
            }
        )

        return LadderModel.create(ladderData);
    }

    /**
     * Получение записи ладдера по участнику
     */
    public getActiveLadderByUserId(userId: string) {
        return LadderModel.findOne({ member_ids: userId, active: true });
    }

    /**
     * Закрывает ладдерную встречу
     */
    public closeLadderRound(_id: string) {
        return LadderModel.findOneAndUpdate({ _id }, { active: false });
    }

    /**
     * Добавление ИД игры в запись турнирной встречи
     */
    public addGameToLadder(_id: string, gameId: string) {
        return LadderModel.findOneAndUpdate({ _id }, { $push: { game_ids: gameId } })
    }
}