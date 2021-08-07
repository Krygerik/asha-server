import {Request, Response} from "express";
import {DictionariesService} from "../modules/dictionaries";
import {mongoError, successResponse} from "../modules/common/services";

export class DictionaryController {
    private dictionaryService: DictionariesService = new DictionariesService();

    /**
     * Получение всех справочников
     */
    public async getDictionaries(req: Request, res: Response) {
        try {
            const allDictionaries = await this.dictionaryService.getAllDictionaries();

            successResponse('Список всех словарей успешно получен', allDictionaries, res);
        } catch (e) {
            return mongoError(e, res);
        }
    }
}