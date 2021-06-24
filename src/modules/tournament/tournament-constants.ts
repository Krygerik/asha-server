
export const AUTO_WIN = 'AUTO_WIN';

/**
 * Граничные значения количества участников турнира
 */
export const BOUNDARY_MEMBER_COUNT_LIST = [
    4,
    8,
    16,
    32,
    64,
];

/**
 * Соотношение количества участников на количество раундов
 */
export const mapCountMemberToCountStage = {
    [4]: 2,
    [8]: 3,
    [16]: 4,
    [32]: 5,
    [64]: 6,
}