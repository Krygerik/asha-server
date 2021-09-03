import {ISavedUser, IUser} from "./model";
import {UserModel} from "./schema";
import {logger} from "../../utils";

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
        return UserModel.findById(id).select('-hash_password');
    }

    /**
     * Получение ИД пользователей по их ид дискорда
     */
    public async getUserIdsByDiscordId(discordIds: string[]) {
        const users = await UserModel.find({ discord: { $in: discordIds }}, { _id: 1 });

        return users.map(user => user._id);
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

    /**
     * Добавление пользователю данных о турнире, на который он зарегистрировался
     */
    public async changePlayerRating(winnerId: string, loserId: string) {
        logger.info(
            'changePlayerRating: Добавление пользователю данных о турнире, на который он зарегистрировался',
            {
                metadata: {
                    winnerId,
                    loserId,
                }
            }
        );

        // @ts-ignore
        const winner: ISavedUser | null = await UserModel.findOne({ _id: winnerId });
        // @ts-ignore
        const looser: ISavedUser | null = await UserModel.findOne({ _id: loserId });

        if (!winner || !looser) {
            logger.warn(
                'changePlayerRating: Не удалось получить данные о победителе или проигравшем',
                {
                    metadata: {
                        winner,
                        looser,
                    }
                }
            );

            return null;
        }

        const updatedRatingFactor = 1 / (1 + 10 ** ((looser.rating - winner.rating) / 400));

        // Смягчающий фактор
        const softFactor = 5;

        const changedRating = softFactor * (1 - updatedRatingFactor);

        const newWinnerRating = Math.round(winner.rating + changedRating);
        const newLooserRating = Math.round(looser.rating - changedRating);

        logger.info(
            'changePlayerRating: Изменение рейтинга участникам игры',
            {
                metadata: {
                    loserId,
                    newLooserRating,
                    newWinnerRating,
                    winnerId,
                }
            }
        );

        await UserModel.findOneAndUpdate({ _id: winnerId }, { rating: newWinnerRating });
        await UserModel.findOneAndUpdate({ _id: loserId }, { rating: newLooserRating });

        const result = {
            [loserId]: {
                changedRating: Math.round(newLooserRating - looser.rating),
                newRating: newLooserRating,
            },
            [winnerId]: {
                changedRating: Math.round(newWinnerRating - winner.rating),
                newRating: newWinnerRating,
            },
        };

        logger.info(
            'changePlayerRating: Возвращаемое значение',
            {
                metadata: {
                    result,
                }
            }
        );

        return result;
    }

    /**
     * Получение списка игроков с рейтингом
     */
    public getPlayerRatingList(limit: number = 0) {
        return UserModel
            .find({}, { nickname: 1, _id: 1, rating: 1 })
            .sort({ rating: 'desc' })
            .limit(limit);
    }
}
