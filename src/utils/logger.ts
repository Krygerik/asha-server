import * as winston from "winston";
import {mongoUrl} from "../constants";
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
 * Кастомный логгер, используемый в проекте
 */
export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.MongoDB(options.dbInfo),
    ],
    exitOnError: false
});
