import {LadderModel} from "./ladder-schema";
import { ILadderRecord } from "./ladder-type";

export class LadderService {
    /**
     * Создание записи ладдера
     */
    public createLadder(ladderData: ILadderRecord) {
        return LadderModel.create(ladderData);
    }
}