import {find, omit} from "lodash";
import {
    EPlayerColor,
    IFilterGames,
    IFindGameOptions,
    ISavedGame,
    ISavedPlayer,
    IShortFilter,
    IShortGame,
    IShortPlayer,
    TCutGames,
    TWinRate,
} from "./model";
import {GameModel} from "./schema";
import {logger} from "../../utils";

export class GameService {
    /**
     * Прообразование полного вида данных по игре в короткий
     */
    private static formatFullGameInfoToShort(gameInfo: ISavedGame): IShortGame {
        return {
            _id: gameInfo._id,
            date: gameInfo.date,
            disconnect: gameInfo.disconnect,
            players: gameInfo.players.map(
                (player: ISavedPlayer): IShortPlayer => ({
                    color: player.color,
                    hero: player.hero,
                    race: player.race,
                    user_id: player.user_id,
                }),
            ),
            map_type: gameInfo.map_type,
            map_version: gameInfo.map_version,
            winner: gameInfo.winner,
        };
    }

    /**
     * Создание записи игры на основе данных, поступивших от любого игрока
     */
    public createGame(gameParams: any) {
        return GameModel.create(gameParams);
    }

    /**
     * получение последних 50 игр
     */
    public getLast50Games() {
        return GameModel.find().sort({_id:-1}).limit(50)

    }
    /**
     * Поиск записи игры в бд
     */
    public findGame(query: any) {
        return GameModel.findOne(query);
    }

    public findOneAndUpdate(query: any, updatedValue: Record<any, any>, option?: Record<any, any>) {
        return GameModel.findOneAndUpdate(query, updatedValue, option);
    }

    /**
     * Обновление записи игры
     */
    public updateGame(_id: string, updatedValue: Record<any, any>, option?: Record<any, any>) {
        return GameModel.updateOne({ _id }, updatedValue, option);
    }

    /**
     * Возвращает фильтр поиска списка краткой информации по всем играм с пагинацией
     */
    private getShortGameInfoQueryFilter(filter: IShortFilter) {
        return {
            ...filter.map_type ? { map_type: filter.map_type } : {},
            ...filter.map_version ? { map_version: filter.map_version } : {},
            waiting_for_disconnect_status: { $ne: true },
            winner: { $ne: null },
            $or: [
                {
                    $and: filter.players.map((item, index) => ({
                        players: {
                            $elemMatch: {
                                ...item,
                                ...index === 0
                                    ? { color: EPlayerColor.RED }
                                    : { color: EPlayerColor.BLUE }
                            }
                        }
                    }))
                },
                {
                    $and: filter.players.map((item, index) => ({
                        players: {
                            $elemMatch: {
                                ...item,
                                ...index === 0
                                    ? { color: EPlayerColor.BLUE }
                                    : { color: EPlayerColor.RED }
                            }
                        }
                    }))
                },
            ]
        }
    }

    /**
     * Получение списка краткой информации по всем играм с пагинацией
     */
    public async getShortGameInfoList(options: IFindGameOptions, filter: IShortFilter): Promise<IShortGame[]> {
        const query = this.getShortGameInfoQueryFilter(filter);

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
        const query = this.getShortGameInfoQueryFilter(filter);

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
        const gameInfoList: ISavedGame[] = await GameModel.find(option).sort({ date: 'desc' }).limit(10);

        return gameInfoList.map(GameService.formatFullGameInfoToShort);
    }

    /**
     * Получение игр с краткой информацией по пользователю
     */
    public async getShortGamesInfoByUser(userId, inputOptions: Record<string, any>): Promise<IShortGame[]> {
        const filterOptions = {
            winner: { $ne: null },
            "players.user_id": userId,
            waiting_for_disconnect_status: { $ne: true },
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
     * Получение маппинга краткой информации по переданным играм на их id
     */
    public async getMappingShortGamesInfoByGameIds(gameIdList: string[]) {
        const filterOptions = {
            _id: { $in: gameIdList },
            winner: { $ne: null },
            waiting_for_disconnect_status: { $ne: true },
        };

        const gameInfoDocList = await GameModel.find(filterOptions);

        // @ts-ignore
        const gameInfoList: ISavedGame[] = gameInfoDocList.map(gameInfo => gameInfo.toObject());

        const shortGameInfoList = gameInfoList.map(GameService.formatFullGameInfoToShort);

        return shortGameInfoList.reduce((acc, shortGameInfo) => ({
            ...acc,
            [shortGameInfo._id]: shortGameInfo
        }), {});
    }

    /**
     * Проставление игре статуса дисконнекта
     */
    public async setGameDisconnectStatus(combat_id: string, disconnect: boolean) {
        logger.info(
            'setGameDisconnectStatus: Проставление игре статуса дисконнекта',
            { metadata: { combat_id, disconnect }}
        );

        const updateFields = {
            disconnect,
            waiting_for_disconnect_status: false,
        };

        logger.info(
            'setGameDisconnectStatus: Сохранение статуса дисконнекта в бд',
            { metadata: { combat_id, updateFields }}
        );

        return GameModel.updateOne({ combat_id }, updateFields);
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
            disconnect: { $ne: true },
            // 2 - означает, что в игре участвовало 2 зарегистрированных участника проекта
            winner: { $ne: null },
            waiting_for_disconnect_status: { $ne: true },
            ...filter.with_unknown ? {} : { players_ids: { $size: 2 } },
            ...filter.map_type ? { map_type: filter.map_type } : {},
            ...filter.map_version ? { map_version: filter.map_version } : {},
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