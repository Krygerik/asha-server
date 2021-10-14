import {EMapVersionValues} from "./map-version-model";
import {MapVersionModel} from "./map-version-schema";

export class MapVersionService {
    /**
     * Получение информации о версии карты по ее значению
     */
    public getMapVersionInfoByValue(value: EMapVersionValues) {
        return MapVersionModel.findOne({ value });
    }
}