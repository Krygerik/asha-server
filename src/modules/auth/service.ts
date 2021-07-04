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

    /**
     * Получение маппинга информации пользователей на их id
     */
    public async getMappingUsersIdToUserShortInfo(ids: string[]) {
        const userListDocs = await UserModel.find(
            { _id: { $in: ids }, },
            {
                nickname: true,
                discord: true,
            }
        );

        const userList = userListDocs.map(a => a.toObject());

        return userList.reduce((acc, userInfo) => ({
            ...acc,
            [userInfo._id]: userInfo,
        }), {})
    }

    /**
     * Добавление пользователю данных о турнире, на который он зарегистрировался
     */
    public addTournamentIdToUser(userId: string, tournamentId: string) {
        const updatedValue = {
            $push: {
                tournaments: tournamentId
            }
        };

        return UserModel.findOneAndUpdate({ _id: userId }, updatedValue);
    }
}
