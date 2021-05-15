import {DictionariesModel} from "./schema";

export class DictionariesService {
    /**
     * Получение всех сохраненных в бд справочников
     */
    public async getDictionaries(callback: any) {
        DictionariesModel.find(callback);
    }
}