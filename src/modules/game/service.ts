import {find, isNil, omit} from "lodash";
import {
    EPlayerColor,
    IInputGameData,
    IInputPlayersData,
    ISavedGame, ISavedPlayer,
    IShortGame, IShortPlayer,
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
                    color: player.color,
                    hero: player.hero,
                    nickname: player.nickname,
                    race: player.race,
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
        const savedGame = await GameModel.findOne({ combat_id: playerData.combat_id });

        if (!isNil(savedGame)) {
            const updatedValue = {
                $push: {
                    players_nicknames: playerData.nickname,
                }
            };

            GameModel.updateOne({ _id: savedGame._id }, updatedValue, callback);
        } else {
            const gameData = {
                ...omit(playerData, 'nickname'),
                players_nicknames: [playerData.nickname],
            }

            this.createGame(gameData, callback);
        }
    }

    /**
     * Сохранение победителя и определение красного игрока
     */
    public async saveGameWinner(winnerData: IWinnerRequestDto, callback: any) {
        const savedGame = await GameModel.findOne({ combat_id: winnerData.combat_id });

        const looserNickname = find(
            // @ts-ignore
            savedGame.players_nicknames,
            (playerNickname: string) => playerNickname !== winnerData.nickname
        );

        const redPlayerNickname = winnerData.isRedPlayer ? winnerData.nickname : looserNickname;
        const bluePlayerNickname = winnerData.isRedPlayer ? looserNickname : winnerData.nickname;

        const updatedValue = {
            $set: {
                "players.$[redPlayer].nickname": redPlayerNickname,
                "players.$[bluePlayer].nickname": bluePlayerNickname,
                winner: winnerData.isRedPlayer ? EPlayerColor.RED : EPlayerColor.BLUE,
                date: winnerData.date,
            }
        };

        const option = {
            multi: true,
            arrayFilters: [
                { "redPlayer.color": EPlayerColor.RED },
                { "bluePlayer.color": EPlayerColor.BLUE },
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
        // @ts-ignore
        const gameInfoList: ISavedGame[] = await GameModel.find({ "players.nickname": nickname })

        return gameInfoList.map(GameService.formatFullGameInfoToShort);
    }
}