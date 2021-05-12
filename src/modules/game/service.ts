import {find, isNil, omit} from "lodash";
import {
    EPlayerColor,
    IInputGameData,
    IInputPlayersData,
    ISavedGame,
    ISavedPlayer,
    IShortGame,
    IShortPlayer,
    IWinnerRequestDto
} from "./model";
import {GameModel} from "./schema";

export class GameService {
    /**
     * Прообразование полного вида данных по игре в короткий
     */
    private static formatFullGameInfoToShort(gameInfo: ISavedGame): IShortGame {
        return {
            _id: gameInfo._id,
            combat_id: gameInfo.combat_id,
            date: gameInfo.date,
            players: gameInfo.players.map(
                (player: ISavedPlayer): IShortPlayer => ({
                    army_remainder: player.army_remainder,
                    color: player.color,
                    hero: player.hero,
                    nickname: player.nickname,
                    race: player.race,
                    user_id: player.user_id,
                }),
            ),
            winner: gameInfo.winner,
        };
    }

    /**
     * Создание записи игры на основе данных, поступивших от любого игрока
     */
    public createGame(gameParams: IInputGameData, callback: any) {
        const session = new GameModel(gameParams);

        session.save(callback);
    }

    /**
     * Создание игры с главными параметрами игрока или добавление их в уже созданную
     */
    public async createOrUpdateGame(playerData: IInputPlayersData, callback: any) {
        // @ts-ignore
        const savedGame: ISavedGame = await GameModel.findOne({ combat_id: playerData.combat_id });

        if (!isNil(savedGame)) {
            let updatedValue;
            let option = {};

            if (!isNil(savedGame.winner)) {
                updatedValue = {
                    $push: {
                        players_ids: playerData.user_id,
                    },
                    $set: {
                        "players.$[player].user_id": playerData.user_id,
                    }
                };

                option = {
                    arrayFilters: [
                        { "player.user_id": null },
                    ]
                };
            } else {
                updatedValue = {
                    $push: {
                        players_ids: playerData.user_id,
                    }
                };
            }

            GameModel.updateOne({ _id: savedGame._id }, updatedValue, option, callback);
        } else {
            const gameData = {
                ...omit(playerData, 'user_id'),
                players_ids: [playerData.user_id],
            }

            this.createGame(gameData, callback);
        }
    }

    /**
     * Сохранение победителя и определение красного игрока
     */
    public async saveGameWinner(requestData: IWinnerRequestDto, callback: any) {
        // @ts-ignore
        const savedGame: ISavedGame = await GameModel.findOne({ combat_id: requestData.combat_id });

        /**
         * Если игра с данным id отсутствует или победитель уже определен - выкидываем
         */
        if (isNil(savedGame) || !isNil(savedGame.winner)) {
            return callback();
        }

        const senderIsWinner = (
            requestData.isRedPlayer && requestData.winner === EPlayerColor.RED
            || !requestData.isRedPlayer && requestData.winner === EPlayerColor.BLUE
        )

        const winnerId = senderIsWinner
            ? requestData.user_id
            : find(
                savedGame.players_ids,
                (playerId: string) => playerId !== requestData.user_id
            );

        const looserId = find(
            savedGame.players_ids,
            (playerId: string) => playerId !== winnerId
        );

        const updatedValue = {
            $set: {
                "players.$[redPlayer].user_id": requestData.winner === EPlayerColor.RED ? winnerId : looserId,
                "players.$[bluePlayer].user_id": requestData.winner === EPlayerColor.BLUE ? winnerId : looserId,
                "players.$[winner].army_remainder": requestData.army_remainder,
                date: requestData.date,
                percentage_of_army_left: requestData.percentage_of_army_left,
                winner: requestData.winner,
            }
        };

        const option = {
            multi: true,
            arrayFilters: [
                { "redPlayer.color": EPlayerColor.RED },
                { "bluePlayer.color": EPlayerColor.BLUE },
                { "winner.color": requestData.winner },
            ]
        };

        GameModel.updateOne({ _id: savedGame._id }, updatedValue, option, callback);
    }

    public findGame(query: any, callback: any) {
        GameModel.findOne(query, callback);
    }

    /**
     * Получение списка краткой информации по всем играм
     */
    public async getShortGameInfoList(items?: string): Promise<IShortGame[]> {
        // @ts-ignore
        let allGameInfoList: ISavedGame[] = await GameModel.find({ winner: { $ne: null } }).sort({ date: 'desc' });

        /**
         * Количество требуемых элементов
         */
        if (items) {
            allGameInfoList = [
                ...allGameInfoList.slice(0, Number(items)),
            ]
        }
        return allGameInfoList.map(GameService.formatFullGameInfoToShort);
    }

    /**
     * Получение игр с краткой информацией по нику игрока
     */
    public async getShortGamesInfoListByCombatId(nickname: string): Promise<IShortGame[]> {
        const option = {
            winner: { $ne: null },
            "players.nickname": nickname,
        };

        // @ts-ignore
        const gameInfoList: ISavedGame[] = await GameModel.find(option)

        return gameInfoList.map(GameService.formatFullGameInfoToShort);
    }

    /**
     * Получение игр с краткой информацией по пользователю
     */
    public async getShortGamesInfoByUser(userId, inputOptions: Record<string, any>): Promise<IShortGame[]> {
        const filterOptions = {
            winner: { $ne: null },
            "players.user_id": userId,
        };

        let additionalOptions = {
            sort: { date: 'desc' },
            ...inputOptions,
        }

        // @ts-ignore
        const gameInfoList: ISavedGame[] = await GameModel.find(filterOptions, null, additionalOptions);

        return gameInfoList.map(GameService.formatFullGameInfoToShort);
    }
}