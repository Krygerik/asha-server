import {MappingNicknameToGameModel} from "./schema";
import {IMappingNicknameToGame} from "./model";

export class MappingNicknameToGame {
    public createEntity(entityParams: IMappingNicknameToGame, callback: any) {
        const session = new MappingNicknameToGameModel(entityParams);

        session.save(callback);
    }
}
