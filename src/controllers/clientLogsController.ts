import {Request, Response} from "express";
import { ClientLogsService } from "../modules/client-logs";
import {internalError, successResponse} from "../modules/common/services";
import {logger} from "../utils";

export class ClientLogsController {
    private clientLogsService: ClientLogsService = new ClientLogsService();

    /**
     * Создание записи лога
     */
    public async createClientLogRecord(req: Request, res: Response) {
        try {
            logger.info(
                'createClientLogRecord: Запрос на создание записи лога',
                { metadata: { reqBody: req.body }}
            );

            const logRecord = await this.clientLogsService.createLogRecord(req.body);

            successResponse('Запись лога успешно создана', logRecord, res);
        } catch (error) {
            logger.error(
                'createClientLogRecord: Ошибка при обработке запроса',
                { metadata: { error }}
            );

            internalError('Ошибка при создании записи лога: ' + error.toString(), res);
        }
    }
}