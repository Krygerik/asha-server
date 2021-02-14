import {IGame} from "./model";
import {GameModel} from "./schema";

export class GameService {
    public createGame(gameParams: IGame, callback: any) {
        const session = new GameModel(gameParams);

        session.save(callback);
    }

    public findGame(query: any, callback: any) {
        GameModel.findOne(query, callback);
    }

    public updateGame(gameParams: IGame, callback: any) {
        const query = { _id: gameParams._id };

        GameModel.findByIdAndUpdate(query, gameParams, callback);
    }

    public deleteGame(_id: string, callback: any) {
        const query = { _id };

        GameModel.deleteOne(query, callback);
    }
}