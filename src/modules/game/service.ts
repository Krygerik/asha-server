import {IInputGameData, ISavedGame, IShortGame} from "./model";
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
            loosing_player: {
                color: gameInfo.loosing_player.color,
                hero: gameInfo.loosing_player.hero,
                nickname: gameInfo.loosing_player.nickname,
                race: gameInfo.loosing_player.race,
            },
            winning_player: {
                color: gameInfo.winning_player.color,
                hero: gameInfo.winning_player.hero,
                nickname: gameInfo.winning_player.nickname,
                race: gameInfo.winning_player.race,
            },
        };
    }

    public createGame(gameParams: IInputGameData, callback: any) {
        const session = new GameModel(gameParams);

        session.save(callback);
    }

    public findGame(query: any, callback: any) {
        GameModel.findOne(query, callback);
    }

    /**
     * Получение списка краткой информации по всем играм
     */
    public async getShortGameInfoList(items?: string): Promise<IShortGame[]> {
        // @ts-ignore
        let allGameInfoList: ISavedGame[] = await GameModel.find().sort({ date: 'desc' });

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
     * Получение игр с краткой информацией по combatId
     */
    public async getShortGamesInfoListByCombatId(combatIdList: number[]): Promise<IShortGame[]> {
        // @ts-ignore
        const gameInfoList: ISavedGame[] = await Promise.all(combatIdList.map(
            async (combatId: number) => await GameModel.findOne({ combat_id: combatId })
        ));

        return gameInfoList.filter(Boolean).map(GameService.formatFullGameInfoToShort);
    }

    public updateGame(gameParams: ISavedGame, callback: any) {
        const query = { _id: gameParams._id };

        GameModel.findByIdAndUpdate(query, gameParams, callback);
    }

    public deleteGame(_id: string, callback: any) {
        const query = { _id };

        GameModel.deleteOne(query, callback);
    }
}