import {Request, Response} from "express";
import {isEmpty, omit} from "lodash";
import * as jwt from "jsonwebtoken";
import {
    entryAlreadyExists,
    failureResponse,
    insufficientParameters,
    mongoError,
    successResponse,
} from "../modules/common/services";
import {AuthService, IUser, ISavedUser} from "../modules/auth";

export class AuthController {
    private authService: AuthService = new AuthService();

    /**
     * Генерация временного токена для пользователя
     */
    private static generateAccessToken(userId: string) {
        return jwt.sign({ userId }, String(process.env.SECRET), { expiresIn: "24h" });
    }

    /**
     * Промежуточный обработчик, проверяющий пользователя на авторизацию
     */
    public static authMiddleware(req: Request, res: Response, next: Function) {
        if (req.method === 'OPTIONS') {
            next();
        }

        try {
            if (!req.headers.authorization) {
                return failureResponse('Пользователь не авторизован', null, res);
            }

            const token = req.headers.authorization.split(' ')[1];

            if (!token) {
                return failureResponse('Пользователь не авторизован', null, res);
            }

            jwt.verify(token, String(process.env.SECRET), (tokenError: any, decodedData: { userId: string }) => {
                if (tokenError) {
                    const message = tokenError.name === 'TokenExpiredError'
                        ? 'Действите токена истекло'
                        : 'Ошибка при работе с токеном';

                    return failureResponse(message, null, res);
                }

                req.body.userId = decodedData.userId;

                next();
            });
        } catch (error) {
            return failureResponse('Ошибка при проверке пользователя на авторизацию', { error }, res);
        }
    }

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

    public async login(req: Request, res: Response) {
        const userData: IUser = req.body;

        if (isEmpty(userData)) {
            return insufficientParameters(res);
        }

        // @ts-ignore
        const user: ISavedUser | null = await this.authService.findUser(userData.email);

        if (!user) {
            return failureResponse(`Пользователь ${userData.email} не найден`, null, res);
        }

        if (userData.hash_password !== user.hash_password) {
            return failureResponse('Введен неверный пароль', null, res);
        }

        const token = AuthController.generateAccessToken(user._id);

        successResponse('Пользователь успешно авторизирован', { token }, res);
    }

    /**
     * Получение профиля текущего пользователя
     */
    public async getProfile(req: Request, res: Response) {
        const { userId }: { userId: string } = req.body;

        // @ts-ignore
        const user: ISavedUser | null = await this.authService.findUserById(userId);

        if (!user) {
            return failureResponse(`Пользователь не найден`, null, res);
        }

        successResponse('Данные пользователя получены успешно', omit(user, 'hash_password'), res);
    }
}