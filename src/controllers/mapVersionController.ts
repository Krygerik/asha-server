import {Request, Response} from "express";
import {failureResponse, insufficientParameters, internalError, successResponse} from "../modules/common/services";
import {IMapVersionValue, IMapVersionRecord, MapVersionService} from "../modules/map-version";

export class MapVersionController {
    private mapVersionService: MapVersionService = new MapVersionService();

    public async getMapVersionInfoByValue(req: Request, res: Response) {
        try {
            const { version }: { version?: IMapVersionValue } = req.query;

            if (!version) {
                return insufficientParameters(res);
            }

            // @ts-ignore
            const mapVersionDoc: IMapVersionRecord | null = await this.mapVersionService.getMapVersionInfoByValue(version);

            if (!mapVersionDoc) {
                return failureResponse(
                    'Версия карты с такими параметрами отсутствует',
                    null,
                    res,
                );
            }

            return successResponse(
                'Запись версии карты успешно получена',
                mapVersionDoc,
                res,
            );
        } catch (error) {
            internalError(error, res);
        }
    }
}