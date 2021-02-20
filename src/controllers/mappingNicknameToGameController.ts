import {Request, Response} from "express";
import {
    entryAlreadyExists,
    hasMaximumEntries,
    insufficientParameters,
    mongoError,
    successResponse,
} from "../modules/common/services";
import {IMappingNicknameToGame, MappingNicknameToGameService} from "../modules/mapping-nickname-to-game";

export class MappingNicknameToGameController {
    private mappingNicknameToGameService: MappingNicknameToGameService = new MappingNicknameToGameService();

    public async createRecord(req: Request, res: Response) {
        if (!req.body.combat_id || !req.body.nickname) {
            return insufficientParameters(res);
        }

        const recordParams: IMappingNicknameToGame = {
            combat_id: req.body.combat_id,
            nickname: req.body.nickname
        }

        if (await this.mappingNicknameToGameService.checkThatGameContainsMaximumEntries(req.body.combat_id)) {
            return hasMaximumEntries(res);
        }

        if (await this.mappingNicknameToGameService.checkingARecordForExisting(recordParams)) {
            return entryAlreadyExists(res);
        }

        this.mappingNicknameToGameService.createEntity(
            recordParams,
            (err: any, recordData: IMappingNicknameToGame) => {
                if (err) {
                    return mongoError(err, res);
                }

                successResponse('Запись связи игрока с игрой успешно создана', recordData, res);
            }
        )
    }
}