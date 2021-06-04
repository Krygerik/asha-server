import {find, forEach, isNil, omit} from "lodash";
import {
    EPlayerColor,
    IFilterGames,
    IFindGameOptions,
    IInputGameData,
    IInputPlayersData,
    ISavedGame,
    ISavedPlayer,
    IShortFilter,
    IShortGame,
    IShortPlayer,
    IWinnerRequestDto,
    TCutGames,
    TWinRate,
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
            disconnect: gameInfo.disconnect,
            players: gameInfo.players.map(
                (player: ISavedPlayer): IShortPlayer => ({
                    army_remainder: player.army_remainder,
                    color: player.color,
                    hero: player.hero,
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
                "players.$[winner].winner": true,
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

    public findGame(query: any) {
        return GameModel.findOne(query);
    }

    /**
     * Получение списка краткой информации по всем играм с пагинацией
     */
    public async getShortGameInfoList(options: IFindGameOptions, filter: IShortFilter): Promise<IShortGame[]> {
        let query = {
            winner: { $ne: null },
        };

        forEach(filter, (value: string, key: string) => {
            query[`players.${key}`] = value;
        });

        // @ts-ignore
        const allGameInfoList: ISavedGame[] = await GameModel
            .find(query)
            .sort({ date: 'desc' })
            .limit(options.items)
            .skip(options.items * (options.requestPage - 1))

        return allGameInfoList.map(GameService.formatFullGameInfoToShort);
    }

    /**
     * Получение количества страниц пагинации для переданных опций
     */
    public async getCountPagesByPageSize(size: number, filter: IShortFilter) {
        let query = {
            winner: { $ne: null },
        };

        forEach(filter, (value: string, key: string) => {
            query[`players.${key}`] = value;
        });

        const count = await GameModel.countDocuments(query);

        return Math.ceil(count/size);
    }

    /**
     * Получение игр с краткой информацией по нику игрока
     */
    public async getShortGamesInfoListByUserId(user_id: string): Promise<IShortGame[]> {
        const option = {
            winner: { $ne: null },
            "players.user_id": user_id,
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

    /**
     * Проставление игре статуса дисконнекта
     */
    public async setGameDisconnectStatus(combat_id: boolean) {
        return GameModel.updateOne({ combat_id }, { disconnect: true });
    }

    /**
     * Получение винрейта по определенному МА
     */
    public async getSingleMatchUpWinRate(
        filter: IFilterGames, mainRaceId?: string, otherRaceId?: string
    ): Promise<TWinRate> {
        const playerWithColor = filter.players.find(player => player.color);

        /**
         * Если у одного из игроков проставлен цвет - не перебираем все цветовые варианты игроков
         */
        if (playerWithColor) {
            const isSelectedRedColor = playerWithColor.color === EPlayerColor.RED;

            const mainPlayerColor = playerWithColor.main
                ? isSelectedRedColor
                    ? EPlayerColor.RED
                    : EPlayerColor.BLUE
                : isSelectedRedColor
                    ? EPlayerColor.BLUE
                    : EPlayerColor.RED;

            const otherPlayerColor = playerWithColor.main
                ? isSelectedRedColor
                    ? EPlayerColor.BLUE
                    : EPlayerColor.RED
                : isSelectedRedColor
                    ? EPlayerColor.RED
                    : EPlayerColor.BLUE;

            const winRates = await this.getSingleMatchUpsWinRateByColors(
                filter, mainRaceId, otherRaceId, mainPlayerColor, otherPlayerColor
            );

            return {
                loses: winRates.loses,
                wins: winRates.wins,
            };
        }



        /**
         * Фильтры игроков не должны пересекаться в 1 сущности, поэтому необходимо их разделить друг от друга
         * В данном случае присваиваем фильтрам разные цвета
         */
        const winRateWithRedMain = await this.getSingleMatchUpsWinRateByColors(
            filter, mainRaceId, otherRaceId, EPlayerColor.RED, EPlayerColor.BLUE
        );

        const winRateWithBlueMain = await this.getSingleMatchUpsWinRateByColors(
            filter, mainRaceId, otherRaceId, EPlayerColor.BLUE, EPlayerColor.RED
        );

        return {
            loses: winRateWithRedMain.loses + winRateWithBlueMain.loses,
            wins: winRateWithRedMain.wins + winRateWithBlueMain.wins,
        }
    }

    /**
     * Получение винрейта по определенному МА с назначенными цветами для обоих игроков
     */
    public async getSingleMatchUpsWinRateByColors (
        filter: IFilterGames, mainRaceId: string, otherRaceId: string, mainColor: number, otherColor: number
    ): Promise<TWinRate> {
        const query: Record<any, any> = {
            $and: filter.players.map((item) => ({
                players: {
                    $elemMatch: {
                        ...omit(item, ['main']),
                        ...item.main
                            ? { race: mainRaceId, color: mainColor }
                            : { race: otherRaceId, color: otherColor },
                    }
                }
            })),
            disconnect: false,
            // 2 - означает, что в игре участвовало 2 зарегистрированных участника проекта
            players_ids: { $size: 2 },
            winner: { $ne: null },
        };

        const cutGamesDoc = await GameModel.find(
            query,
            { players: { winner: true, race: true, color: true } }
        );

        // @ts-ignore
        const cutGames: TCutGames[] = cutGamesDoc.map(doc => doc.toObject());

        const wins = cutGames.filter(
            game => find(game.players, { winner: true, color: mainColor })
        );

        const loses = cutGames.filter(
            game => find(game.players, { winner: true, color: otherColor })
        );

        return {
            loses: loses.length,
            wins: wins.length,
        };
    }
}