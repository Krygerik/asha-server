
export const CREATE_LADDER_RESPONSE_MESSAGES = {
    ERRORS: {
        // Отсутствуют необходимые данные в запросе
        NO_DATA: 'no_data',
        // Недостаточно данных в запросе
        NOT_ENOUGH_DATA: 'not_enough_data',
        // Слишком много игроков с такими данными
        TOO_MUCH_PLAYERS_WITH_SUCH_DATA: 'too_much_players_with_such_data',
    },
    SUCCESS: {
        // Рейтинговая встреча успешно создана
        LADDER_SUCCESSFULLY_CREATED: 'ladder_successfully_created',
    }
};

export const CANCEL_LADDER_RESPONSE_MESSAGES = {
    ERROR: {
        // Отсутствует информация об игроке
        NO_DATA: 'no_data',
        // Игрок с таким тегом дискорда отсутствует
        PLAYER_NOT_FOUND: 'player_not_found'
    },
    SUCCESS: {
        // У данного игрока отсутствуют открытые встречи
        PLAYER_HAS_NO_LADDER: 'player_has_no_open_ladder',
        // Активная встреча успешно закрыта
        LADDER_SUCCESSFULLY_CLOSE: 'ladder_successfully_close',
    }
}