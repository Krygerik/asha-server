import { ClientLogsModel } from "./client-logs-schema";
import { IClientLogs } from "./client-logs-types";

export class ClientLogsService {
    /**
     * Создание записи лога в бд
     */
    public createLogRecord(recordData: IClientLogs) {
        return ClientLogsModel.create(recordData);
    }
}