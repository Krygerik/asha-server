import {isNull, isUndefined, some} from "lodash";
import {IGame} from "./model";

const isNullOrUndefined = (value: any) => isNull(value) || isUndefined(value);

/**
 * Проверка наличия пустых полей в запросе
 */
export const hasMissingField = (requestBody: IGame) => some(
    [
        requestBody.combat_id,
        requestBody.date,
        requestBody.loosing_player,
        requestBody.winning_player,
    ],
    isNullOrUndefined,
);
