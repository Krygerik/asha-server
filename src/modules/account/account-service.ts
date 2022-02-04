import * as passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import {AccountModel} from "./account-schema";
import {IAccount, IMergeAccountData} from "./account-types";

export class AccountService {
    constructor() {
        passport.serializeUser((user, done) => {
            done(null, user.id);
        })

        passport.deserializeUser(async (id, done) => {
            const discordBind = await AccountModel.findById(id);

            if (discordBind) done(null, discordBind);
        })

        let callbackURL = 'http://localhost:4000/api/account/discord-callback';

        if (process.env.NODE_ENV === 'production') {
            callbackURL = 'http://46.101.232.123:3002/api/account/discord-callback';
        }

        if (process.env.NODE_ENV === 'test') {
            callbackURL = 'http://46.101.232.123:4002/api/account/discord-callback';
        }

        console.log('callbackURL:', callbackURL);
        console.log('process.env.APP_DISCORD_CLIENT_ID:', process.env.APP_DISCORD_CLIENT_ID);
        console.log('process.env.APP_DISCORD_CLIENT_SECRET:', process.env.APP_DISCORD_CLIENT_SECRET);

        passport.use(new DiscordStrategy({
            callbackURL,
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

    public updateAccountNickname(_id: string, nickname: string) {
        return AccountModel.findOneAndUpdate({ _id }, { $set: { nickname }});
    }

    public updateAccountGameInfo(_id: string, original_rating: number) {
        return AccountModel.findOneAndUpdate({ _id }, { $set: { original_rating }});
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

        console.log('account:', account);

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
        return AccountModel.find(null, { nickname: 1, _id: 1 });
    }

    public getPlayerRatingList(limit: number = 0) {
        return AccountModel
            .find({}, { nickname: 1, _id: 1, rating: 1, discord: 1 })
            .sort({ rating: 'desc' })
            .limit(limit);
    }
}