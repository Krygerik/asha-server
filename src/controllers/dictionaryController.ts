import {Request, Response} from "express";
import {DictionariesService, IDictionary} from "../modules/dictionaries";
import {mongoError, successResponse} from "../modules/common/services";

export class DictionaryController {
    private dictionaryService: DictionariesService = new DictionariesService();

    /**
     * Получение всех справочников
     */
    public getDictionaries(req: Request, res: Response) {
        this.dictionaryService.getDictionaries((err: any, dictionaries: IDictionary[]) => {
            if (err) {
                return mongoError(err, res);
            }

            const associativeArray = {};

            dictionaries.forEach((item: IDictionary) => {
                associativeArray[item.name] = {
                    name: item.name,
                    records: item.records,
                };
            });

            successResponse('Список всех словарей успешно получен', associativeArray, res);
        })
    }
}