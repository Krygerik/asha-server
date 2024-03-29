import * as passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import {AccountModel} from "./account-schema";
import {IAccount, IMergeAccountData} from "./account-types";
import {logger} from "../../utils";
import {uuid} from "uuidv4";

export class AccountService {
    constructor() {
        passport.serializeUser((user, done) => {
            done(null, user.id);
        })

        passport.deserializeUser(async (id, done) => {
            const discordBind = await AccountModel.findById(id);

            if (discordBind) done(null, discordBind);
        })

        passport.use(new DiscordStrategy({
            callbackURL: process.env.APP_BACKEND_URI + '/api/account/discord-callback',
            clientID: process.env.APP_DISCORD_CLIENT_ID,
            clientSecret: process.env.APP_DISCORD_CLIENT_SECRET,
            scope: ['identify', 'email', 'guilds']
        }, async (accessToken, refreshToken, profile, done) => {
            try {
                // @ts-ignore
                const user: IAccount | null = await AccountModel.findOne({ discordId: profile.id });

                if (user) {
                    done(null, user);

                    return
                }

                // @ts-ignore
                const createdAccount: IAccount | null = await AccountModel.create({
                    clientConnectId: uuid(),
                    create_date: new Date(),
                    discordId: profile.id,
                    discriminator: profile.discriminator,
                    username: profile.username,
                })

                done(null, createdAccount);
            } catch (err) {
                done(err, null);
            }
        }));
    }

    public getAccountByMongoId(id: string) {
        return AccountModel.findById(id, { clientConnectId: 0 });
    }

    public getAccountByClientTokenId(clientConnectId: string) {
        return AccountModel.findOne({ clientConnectId });
    }

    public updateAccountNickname(_id: string, nickname: string, visible: boolean) {
        return AccountModel.findOneAndUpdate({ _id }, { $set: { nickname, visible }});
    }

    public updateAccountGameInfo(_id: string, original_rating: number, visible: boolean) {
        return AccountModel.findOneAndUpdate({ _id }, { $set: { original_rating, visible }});
    }

    public updateAccountMergingStatus(_id: string, merged_with_old_account: boolean) {
        return AccountModel.findOneAndUpdate({ _id }, { $set: { merged_with_old_account }});
    }

    public updateAccountBanStatus(_id: string, banned: boolean) {
        return AccountModel.findOneAndUpdate({ _id }, { $set: { banned }});
    }

    public updateAccountClientToken(_id: string, clientConnectId: string) {
        return AccountModel.findOneAndUpdate({ _id }, { $set: { clientConnectId }});
    }

    public async mergeOldAccountData(id: string, oldAccount: IMergeAccountData): Promise<IAccount> {
        const accountDoc = await AccountModel.findById(id);

        if (!accountDoc) {
            throw new Error('Не удалось найти аккаунт с id:' + id);
        }

        // @ts-ignore
        const account: IAccount = accountDoc.toObject();

        const createdAccountDoc = await AccountModel.create({
            ...account,
            _id: oldAccount._id,
            merged_with_old_account: true,
            nickname: oldAccount.nickname,
            original_rating: oldAccount.original_rating,
            rating: oldAccount.rating,
            roles: oldAccount.roles,
            tournaments: oldAccount.tournaments,
        });

        if (!createdAccountDoc) {
            throw new Error('Не удалось сохранить аккаунт с новым id:' + id);
        }

        const deletedAccountDoc = await AccountModel.findByIdAndDelete(account._id);

        if (!deletedAccountDoc) {
            throw new Error('Не удалось найти и удалить устаревший аккаунт с id:' + account._id);
        }

        // @ts-ignore
        return createdAccountDoc.toObject();
    }

    public getIdWithNicknameFromAllAccounts() {
        return AccountModel.find({}, { username: 1, _id: 1, visible: 1 });
    }

    public getPlayerRatingList(limit: number = 0) {
        return AccountModel
            .find({}, { username: 1, _id: 1, rating: 1 })
            .sort({ rating: 'desc' })
            .limit(limit);
    }

    public async getUserIdByDiscordData(username: string, discriminator: string) {
        return AccountModel.findOne({ username, discriminator }, { _id: 1 });
    }

    public async getUserNicknameListByUserIdList(userIdList: string[]) {
        const accounts = await AccountModel.find({ _id: { $in: userIdList }});

        return accounts
            .map(account => account.toObject())
            .reduce((accumulator, account: IAccount) => ({
                ...accumulator,
                [account._id]: { nickname: account?.username, visible: account?.visible },
            }), {});
    }

    public async changePlayerRating(winnerId: string, looserId: string) {
        logger.info(
            'changePlayerRating: Изменение рейтинга участникам игры',
            { metadata: { winnerId, looserId } }
        );

        const winner: IAccount = await AccountModel.findOne({ _id: winnerId });
        const looser: IAccount = await AccountModel.findOne({ _id: looserId });

        const updatedRatingFactor = 1 / (1 + 10 ** ((looser.rating - winner.rating) / 400));

        // Смягчающий фактор
        const softFactor = 5;

        const changedRating = softFactor * (1 - updatedRatingFactor);

        const newWinnerRating = Math.round(winner.rating + changedRating);
        const newLooserRating = Math.round(looser.rating - changedRating);

        logger.info(
            'changePlayerRating: Сохранение изменений рейтинга в аккаунты',
            { metadata: { winnerId, newWinnerRating, looserId, newLooserRating } }
        );

        await AccountModel.updateOne({ _id: winnerId }, { rating: newWinnerRating });
        await AccountModel.updateOne({ _id: looserId }, { rating: newLooserRating });

        const result = {
            [looserId]: {
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
            { metadata: { result } }
        );

        return result;
    }

    public async getMappingUserIdToUserShortInfo(userIdList: string[]) {
        const accountDocs = await AccountModel.find(
            { _id: { $in: userIdList }},
            { username: true, discordId: true, discriminator: true });

        return accountDocs
            .map(a => a.toObject())
            .reduce((accumulator, account) => ({
               ...accumulator,
               [account._id]: account,
            }), []);
    }

    public addAccountParticipantTournament(_id: string, tournamentId: string) {
        return AccountModel.findOneAndUpdate({ _id }, { $push: { tournaments: tournamentId }});
    }
}