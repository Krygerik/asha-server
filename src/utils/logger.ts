import * as winston from "winston";
import "winston-mongodb";
import {EEnvironment} from "../constants";
import {
  COMBAT_ID_FIELD_NAME,
  TREAD_ID_FIELD_NAME,
  USER_ID_FIELD_NAME,
  clsNamespace,
} from "./logger-constants";

/**
 * Опции для подключения в монгодб
 */
const options = {
  dbInfo: {
    level: "info",
    collection: "server-logs",
    db: process.env.APP_DB_URI,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    maxsize: 52428800, // 50MB
  },
}

/**
 * Форматтер, добавляющий в каждый лог ИД пространства имен, уникальное для каждого запроса
 */
const addTraceId = winston.format((info) => {
  const treadId = clsNamespace.get(TREAD_ID_FIELD_NAME)
  const combat_id = clsNamespace.get(COMBAT_ID_FIELD_NAME)
  const userId = clsNamespace.get(USER_ID_FIELD_NAME)

  return {
    ...info,
    metadata: {
      ...info.metadata,
      combat_id,
      treadId,
      userId,
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
export const logger = process.env.NODE_ENV !== EEnvironment.UnitTests
  ? winston.createLogger({
    level: 'info',
    format: combinedFormatter,
    transports: [
      new winston.transports.MongoDB(options.dbInfo),
    ],
    exitOnError: false
  })
  : winston.createLogger({
    silent: true,
  });
