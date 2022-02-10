import {UserModel} from "./schema";

export class AuthService {
    public findUser(email: string) {
        return UserModel.findOne({email});
    }

    /**
     * Установка статуса, что данные пользователя перенесены в новый аккаунт
     */
    public setAccountMergingStatus(_id: string, account_merging_status: boolean) {
        return UserModel.findOneAndUpdate({ _id }, { $set: { account_merging_status }});
    }
}
