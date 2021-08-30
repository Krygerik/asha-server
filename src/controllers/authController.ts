import {Request, Response} from "express";
import {isEmpty, pick} from "lodash";
import * as jwt from "jsonwebtoken";
import {
    entryAlreadyExists,
    failureResponse,
    insufficientParameters,
    internalError,
    mongoError,
    successResponse,
} from "../modules/common/services";
import {AuthService, IUser, ISavedUser} from "../modules/auth";
import {TournamentService} from "../modules/tournament";

export class AuthController {
    private authService: AuthService = new AuthService();
    private tournamentService: TournamentService = new TournamentService();

    /**
     * Генерация временного токена для пользователя
     */
    private static generateAccessToken(userId: string, roles: string[]) {
        return jwt.sign({ userId, roles }, String(process.env.SECRET), { expiresIn: "100d" });
    }

    /**
     * Промежуточный обработчик, проверяющий пользователя на авторизацию
     */
    public static authMiddleware(accessRole?: string) {
        return async function(req: Request, res: Response, next: Function) {
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

                // @ts-ignore
                const decodedData: { userId: string, roles?: string[] } = jwt.verify(token, String(process.env.SECRET));

                if (accessRole && !decodedData.roles?.includes(accessRole)) {
                    return failureResponse('Пользователь не имеет привелегий для данной операции', null, res);
                }

                req.body.userId = decodedData.userId;
                req.body.roles = decodedData.roles;

                next();
            } catch (error) {
                let message = 'Ошибка при работе с токеном';

                if (error.name === 'TokenExpiredError') {
                    message = 'Действите токена истекло';
                }
                if (error.name === 'JsonWebTokenError') {
                    message = 'Неправильный токен';
                }
                return failureResponse(message, { error }, res);
            }
        }
    }

    public async registration(req: Request, res: Response) {
        try {
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
        } catch (error) {
            internalError(error, res);
        }
    }

    public async login(req: Request, res: Response) {
        try {
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

            const token = AuthController.generateAccessToken(user._id, user.roles);

            successResponse('Пользователь успешно авторизирован', { token }, res);
        } catch (error) {
            internalError(error, res);
        }

    }

    /**
     * Получение профиля текущего пользователя или того, чей id передан
     * (Только для авторизованных)
     */
    public async getProfile(req: Request, res: Response) {
        try {
            const { userId }: { userId: string } = req.body;
            // @ts-ignore
            const { id }: { id: string } = req.params;

            // @ts-ignore
            const userDoc = await this.authService.findUserById(id || userId);

            if (!userDoc) {
                return failureResponse(`Пользователь не найден`, null, res);
            }

            // @ts-ignore
            const user: ISavedUser = userDoc.toObject();

            const mapTournamentNameToId = await this.tournamentService.getMapTournamentNameToIdByIdList(user.tournaments);

            successResponse(
                'Данные пользователя получены успешно',
                {
                    ...user,
                    mapTournamentNameToId,
                },
                res,
            );
        } catch (error) {
            internalError(error, res);
        }
    }

    /**
     * Получение списка Id с ником всех пользователей
     */
    public async getAllUsersList(req: Request, res: Response) {
        try {
            const allUserList = await this.authService.findAllUsers();

            successResponse('Список пользователей успешно получен', allUserList, res);
        } catch (error) {
            internalError(error, res);
        }
    }

    /**
     * Получение топа рейтинга всех игроков
     */
    public async getTopRatingUserList(req: Request, res: Response) {
        try {
            const playerList = await this.authService.getPlayerRatingList(Number(req.query.limit));

            successResponse('Список пользователей с рейтингом успешно получен', playerList, res);
        } catch (error) {
            internalError(error, res);
        }
    }
}