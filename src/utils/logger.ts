import * as winston from "winston";
import {mongoUrl} from "../constants";
import {clsNamespace, TREAD_ID_FIELD_NAME} from "./logger-constants";
import "winston-mongodb";

/**
 * Опции для подключения в монгодб
 */
const options = {
    dbInfo: {
        level: "info",
        collection: "server-logs",
        db: mongoUrl,
        options: { useNewUrlParser: true, useUnifiedTopology: true },
        maxsize: 52428800, // 50MB
    },
}

/**
 * Форматтер, добавляющий в каждый лог ИД пространства имен, уникальное для каждого запроса
 */
const addTraceId = winston.format((info) => {
    const treadId = clsNamespace.get(TREAD_ID_FIELD_NAME)

    return {
        ...info,
        metadata: {
            ...info.metadata,
            treadId,
        },
    }
})();

const combinedFormatter = winston.format.combine(
    winston.format.json(),
    addTraceId,
);

/**
 * Кастомный логгер, используемый в проекте
 */
export const logger = winston.createLogger({
    level: 'info',
    format: combinedFormatter,
    transports: [
        new winston.transports.MongoDB(options.dbInfo),
    ],
    exitOnError: false
});
