import {EPlayerColor} from "../game";

/**
 * Получение запроса для обновления основных данных турнира
 */
export const getMainDataQuery = (
    gameId: string,
    numberOfRound: number,
    winCount: number,
    winnerId: string
) => ({
    update: {
        $set: {
            "grid.$[round].players.$[winner].win_count": winCount,
        },
        $push: {
            "grid.$[round].games": gameId,
        },
    },
    options : {
        arrayFilters: [
            { "round.number_of_round": numberOfRound },
            { "winner.user_id": winnerId },
        ]
    }
})

/**
 * Получение запроса для обновления финальных данных по встрече
 */
export const getFinishRoundDataQuery = (isFinishGame: boolean, winnerId: string, numberOfRound: number) => ({
    update: {
        $set: isFinishGame
            ? {
                "grid.$[round].winner_id": winnerId,
                ...numberOfRound === 1
                    ? { winnerId }
                    : {}
            }
            : {},
    },
})

/**
 * Получение запроса для обновления турнирной сетки
 */
export const getChangeGridDataQuery = (
    needChangeGrid: boolean,
    nextRoundPlayersCount: number,
    parentRoundNumber: number,
    winnerId: string,
) => ({
    update: {
        $push: needChangeGrid
            ? {
                "grid.$[nextRound].players": {
                    color: nextRoundPlayersCount === 0
                        ? EPlayerColor.RED
                        : EPlayerColor.BLUE,
                    user_id: winnerId,
                    win_count: 0,
                }
            }
            : {}
    },
    options : {
        arrayFilters: needChangeGrid
            ? [ { "nextRound.number_of_round": parentRoundNumber } ]
            : [],
    }
})
