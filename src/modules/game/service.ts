import {IInputGameData, ISavedGame, IShortGame} from "./model";
import {GameModel} from "./schema";

export class GameService {
    public createGame(gameParams: IInputGameData, callback: any) {
        const session = new GameModel(gameParams);

        session.save(callback);
    }

    public findGame(query: any, callback: any) {
        GameModel.findOne(query, callback);
    }

    /**
     * Получение игр с краткой информацией по combatId
     */
    public async findGames(combatIdList: number[]): Promise<IShortGame[]> {
        // @ts-ignore
        const gameInfoList: ISavedGame[] = await Promise.all(combatIdList.map(
            async (combatId: number) => await GameModel.findOne({ combat_id: combatId })
        ));

        return gameInfoList.filter(Boolean).map((gameInfo: ISavedGame) => ({
            _id: gameInfo._id,
                combat_id: gameInfo.combat_id,
                date: gameInfo.date,
                loosing_player: {
                nickname: gameInfo.loosing_player.nickname,
                    race: gameInfo.loosing_player.race,
                    hero: gameInfo.loosing_player.hero,
            },
            winning_player: {
                nickname: gameInfo.winning_player.nickname,
                    race: gameInfo.winning_player.race,
                    hero: gameInfo.winning_player.hero,
            },
        }));
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