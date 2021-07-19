import { uuid } from 'uuidv4';
import {clsNamespace, TREAD_ID_FIELD_NAME} from "./logger-constants";


/**
 * Обработчик, добавляющий в каждый поток выполнения уникальный ИД
 */
export const loggerMiddleware = (req, res, next) => {
    // req и res - это event emitters. Мы хотим иметь доступ к CLS контексту внутри их коллбеков
    clsNamespace.bind(req)
    clsNamespace.bind(res)

    const treadId = uuid();

    clsNamespace.run(() => {
        clsNamespace.set(TREAD_ID_FIELD_NAME, treadId);

        next();
    })
}