import {Request, Response} from "express";
import {DictionariesService} from "../modules/dictionaries";
import {mongoError, successResponse} from "../modules/common/services";
import {MapVersionService} from "../modules/map-version";

export class DictionaryController {
    private dictionaryService: DictionariesService = new DictionariesService();
    private mapVersionService: MapVersionService = new MapVersionService();

    /**
     * Получение всех игровых справочников
     */
    public async getDictionaries(req: Request, res: Response) {
        try {
            const gameDataDictionaries = await this.dictionaryService.getAllDictionaries();

            successResponse(
                'Список всех словарей игровых данных успешно получен',
                gameDataDictionaries,
                res,
            );
        } catch (e) {
            return mongoError(e, res);
        }
    }

    /**
     * Получение внутренних словарей неигровых свойств асхи
     */
    public async getAshaDictionaries(req: Request, res: Response) {
        try {
            const mapVersions = await this.mapVersionService.getMapVersionDictionary();

            successResponse(
                'Список всех внутренних словарей успешно получен',
                { mapVersions },
                res,
            );
        } catch (e) {
            return mongoError(e, res);
        }
    }
}