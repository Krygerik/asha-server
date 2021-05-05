import { IUser } from "./model";
import {UserModel} from "./schema";

export class AuthService {
    public createUser(userData: IUser, callback: any) {
        const session = new UserModel(userData);

        session.save(callback);
    }

    public findUser(email: string) {
        return UserModel.findOne({email});
    }
}