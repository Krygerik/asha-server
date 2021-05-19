import {ISavedUser, IUser} from "./model";
import {UserModel} from "./schema";

export class AuthService {
    public createUser(userData: IUser, callback: any) {
        const session = new UserModel(userData);

        session.save(callback);
    }

    public findUser(email: string) {
        return UserModel.findOne({email});
    }

    /**
     * Нахождение пользователя по id в бд
     */
    public findUserById(id: string) {
        return UserModel.findById(id);
    }

    /**
     * Маппинг Id игроков к никам
     */
    public async getRelatedMappingUserIdToUserNickname(idList: string[]) {
        // @ts-ignore
        const users: ISavedUser[] = await UserModel.find({ _id: { $in: idList } });

        return users.reduce((acc, user) => ({
            ...acc,
            [user._id]: user.nickname
        }), {})
    }

    /**
     * Получение списка id и ников всех пользователей
     */
    public findAllUsers() {
        return UserModel.find(null, { nickname: 1, _id: 1 });
    }
}
