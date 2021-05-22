import {DictionariesModel} from "./schema";
import {EDictionaryName} from "./model";

export class DictionariesService {
    /**
     * Получение всех сохраненных в бд справочников
     */
    public async getDictionaries(callback: any) {
        DictionariesModel.find(callback);
    }

    /**
     * Получение конкретного справочника
     */
    public async getDictionary(name: EDictionaryName) {
        return DictionariesModel.findOne({ name });
    }
}