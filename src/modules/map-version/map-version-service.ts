import {IMapVersionValue} from "./map-version-model";
import {MapVersionModel} from "./map-version-schema";

export class MapVersionService {
    /**
     * Получение информации о версии карты по ее значению
     */
    public getMapVersionInfoByValue(value: IMapVersionValue) {
        return MapVersionModel.findOne({ value });
    }
}