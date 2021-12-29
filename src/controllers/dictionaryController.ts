import {Request, Response} from "express";
import {DictionariesService} from "../modules/dictionaries";
import {mongoError, successResponse} from "../modules/common/services";
import {MapVersionService} from "../modules/map-version";

export class DictionaryController {
    private dictionaryService: DictionariesService = new DictionariesService();
    private mapVersionService: MapVersionService = new MapVersionService();

    /**
     * Получение всех справочников
     */
    public async getDictionaries(req: Request, res: Response) {
        try {
            const gameDataDictionaries = await this.dictionaryService.getAllDictionaries();
            const mapVersions = await this.mapVersionService.getMapVersionDictionary();

            successResponse(
                'Список всех словарей успешно получен',
                {
                    ...gameDataDictionaries,
                    mapVersions,
                },
                res,
            );
        } catch (e) {
            return mongoError(e, res);
        }
    }
}