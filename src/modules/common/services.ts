import {Response} from 'express';
import {responseStatusCodes} from './model';

export function successResponse(message: string, DATA: any, res: Response) {
    res.status(responseStatusCodes.success).json({
        STATUS: 'SUCCESS',
        MESSAGE: message,
        DATA
    });
}

export function failureResponse(message: string, DATA: any, res: Response) {
    res.status(responseStatusCodes.bad_request).json({
        STATUS: 'FAILURE',
        MESSAGE: message,
        DATA
    });
}

export function insufficientParameters(res: Response) {
    res.status(responseStatusCodes.bad_request).json({
        STATUS: 'FAILURE',
        MESSAGE: 'Недостаточно данных в запросе',
    });
}

export function incorrectParameters(res: Response) {
    res.status(responseStatusCodes.bad_request).json({
        STATUS: 'FAILURE',
        MESSAGE: 'Некорректные параметры запроса',
    });
}

export function entryAlreadyExists(res: Response) {
    res.status(responseStatusCodes.bad_request).json({
        STATUS: 'FAILURE',
        MESSAGE: 'Запись уже существует в базе данных',
    })
}

export function hasMaximumEntries(res: Response) {
    res.status(responseStatusCodes.bad_request).json({
        STATUS: 'FAILURE',
        MESSAGE: 'Достигнут максимум записей с такими условиями',
    })
}

export function mongoError(err: any, res: Response) {
    res.status(responseStatusCodes.internal_server_error).json({
        STATUS: 'FAILURE',
        MESSAGE: 'MongoDB error',
        DATA: err
    });
}