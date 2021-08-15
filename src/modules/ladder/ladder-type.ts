
/**
 * Тип записи ладдера
 */
export interface ILadderRecord {
    // Активна ли текущая ладдерная встреча
    active: boolean;
    // Игры, проведенные рамках встречи
    game_ids: string[];
    // Игроки, участвующие в стрече
    member_ids: string[];
}
