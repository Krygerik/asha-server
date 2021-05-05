import {Request, Response} from "express";
import {isEmpty} from "lodash";
import {entryAlreadyExists, insufficientParameters, mongoError, successResponse} from "../modules/common/services";
import {AuthService, IUser} from "../modules/auth";

export class AuthController {
    private authService: AuthService = new AuthService();

    public async registration(req: Request, res: Response) {
        const userData: IUser = req.body;

        if (isEmpty(userData)) {
            return insufficientParameters(res);
        }

        const user = await this.authService.findUser(userData.email);

        if (user) {
            return entryAlreadyExists(res);
        }

        this.authService.createUser(userData, (err: any) => {
            if (err) {
                return mongoError(err, res);
            }

            successResponse('Пользователь успешно зарегистрирован', null, res);
        });
    }
}