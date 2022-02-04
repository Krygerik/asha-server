import {Request, Response} from "express";
import { uuid } from 'uuidv4';
import {AccountService} from "../modules/account";
import {
    failureResponse,
    insufficientParameters,
    internalError,
    successResponseWithoutMessage,
} from "../modules/common/services";
import {
    IAccount,
    IUpdateAccountGameInfoRequestBody,
    IUpdateNicknameInfoRequestBody
} from "../modules/account/account-types";
import {TournamentService} from "../modules/tournament";
import {AuthService, ISavedUser} from "../modules/auth";

export class AccountController {
    private accountService: AccountService = new AccountService();
    private authService: AuthService = new AuthService();
    private tournamentService: TournamentService = new TournamentService();

    /**
     * Привязываем ид сессии к аккаунту
     */
    public async redirectToClientRootPage(req: Request, res: Response) {
        let clientRootPage = 'http://localhost:3000';

        if (process.env.NODE_ENV === 'production') {
            clientRootPage = 'http://46.101.232.123';
        }

        if (process.env.NODE_ENV === 'test') {
            clientRootPage = 'http://46.101.232.123:8080';
        }

        res.redirect(clientRootPage)
    }

    /**
     * Получение профиля пользователя из паспорта дискорда
     */
    public async getProfile(req: Request, res: Response) {
        try {
            // @ts-ignore
            const { id }: { id: string } = req.params;

            /**
             * Если запрашиваем текущего пользователя
             */
            if (!id) {
                // @ts-ignore
                return successResponseWithoutMessage(req.user, res);
            }

            const accountDoc = await this.accountService.getAccountByMongoId(id);

            if (!accountDoc) {
                return failureResponse(`Пользователь с id: ${id} не найден`, null, res);
            }

            // @ts-ignore
            const account: IAccount | null = accountDoc.toObject();

            const mapTournamentNameToId = await this.tournamentService.getMapTournamentNameToIdByIdList(
                account.tournaments
            );

            successResponseWithoutMessage({
                ...account,
                mapTournamentNameToId,
            }, res);
        }  catch (error) {
            internalError(error, res);
        }
    }


    /**
     * Обновление ника и дискорда игрока
     */
    public async updateAccountNickname(req: Request, res: Response) {
        try {
            const { id, nickname }: IUpdateNicknameInfoRequestBody = req.body;

            if (!nickname || !id) {
                return failureResponse('Отсутствуют данные для изменения', null, res);
            }

            await this.accountService.updateAccountNickname(id, nickname);

            successResponseWithoutMessage({ id, nickname }, res);
        } catch (error) {
            internalError(error, res);
        }
    }

    /**
     * Обновление игровых данных игрока
     */
    public async updateUserGameInfo(req: Request, res: Response) {
        try {
            const { id, original_rating }: IUpdateAccountGameInfoRequestBody = req.body;

            if (!id || !original_rating) {
                return failureResponse('Отсутствуют данные для изменения', null, res);
            }

            await this.accountService.updateAccountGameInfo(id, original_rating);

            successResponseWithoutMessage({ id, original_rating }, res);
        } catch (error) {
            internalError(error, res);
        }
    }

    /**
     * Отказ пользователя от слияния аккаунтов
     */
    public async cancelAccountMerging(req: Request, res: Response) {
        try {
            const { id }: { id?: string } = req.body;

            if (!id) {
                return insufficientParameters(res);
            }

            const account = await this.accountService.updateAccountMergingStatus(id, true);

            if (!account) {
                return failureResponse(`Не удалось найти аккаунт с таким id: ${id}`, null, res);
            }

            successResponseWithoutMessage(account.toObject(), res);
        } catch (error) {
            internalError(error, res);
        }
    }

    /**
     * Слияние старого аккаунта с новым
     */
    public async mergingOldAccount(req: Request, res: Response) {
        try {
            const {
                id, email, hash_password
            }: {
                id?: string; email?: string; hash_password?: string;
            } = req.body;

            if (!id || !email || !hash_password) {
                return insufficientParameters(res);
            }

            const oldAccountDoc = await this.authService.findUser(email);

            if (!oldAccountDoc) {
                return failureResponse(`Пользователь "${email}" не найден`, null, res);
            }

            // @ts-ignore
            const oldAccount: ISavedUser = oldAccountDoc.toObject();

            if (hash_password !== oldAccount.hash_password) {
                return failureResponse('Введен неверный пароль', null, res);
            }

            const newAccount: IAccount = await this.accountService.mergeOldAccountData(id, oldAccount);

            await this.authService.setAccountMergingStatus(oldAccount._id, true);

            // TODO: Добавить ворнинг логгер, с проверкой сохранился ли фраг в старом аккаунте

            successResponseWithoutMessage(newAccount, res);
        } catch (error) {
            internalError(error, res);
        }
    }

    /**
     * Блокировка/разблокировка аккаунта
     */
    public async changeAccountBanStatus(req: Request, res: Response) {
        try {
            const { id, status }: { id?: string; status?: boolean } = req.body;

            if (!id || status === undefined) {
                return insufficientParameters(res);
            }

            const updatedAccountDoc = await this.accountService.updateAccountBanStatus(id, status);

            if (!updatedAccountDoc) {
                return failureResponse(`Не удалось найти аккаунт с id ${id}:`, null, res);
            }

            successResponseWithoutMessage(updatedAccountDoc.toObject(), res);
        } catch (error) {
            internalError(error, res);
        }
    }

    /**
     * Получение списка Id с ником всех пользователей
     */
    public async getAllUsersList(req: Request, res: Response) {
        try {
            const idWithNickNames = await this.accountService.getIdWithNicknameFromAllAccounts();

            successResponseWithoutMessage(idWithNickNames, res);
        } catch (error) {
            internalError(error, res);
        }
    }

    /**
     * Получение топа рейтинга всех игроков
     */
    public async getTopRatingUserList(req: Request, res: Response) {
        try {
            const playerList = await this.accountService.getPlayerRatingList(Number(req.query.limit));

            successResponseWithoutMessage(playerList, res);
        } catch (error) {
            internalError(error, res);
        }
    }

    /**
     * Получение токена клиента
     */
    public async getClientToken(req: Request, res: Response) {
        try {
            // @ts-ignore
            successResponseWithoutMessage(req?.user?.clientConnectId, res);
        } catch (error) {
            internalError(error, res);
        }
    }

    /**
     * Перегенерация токена клиента
     */
    public async regenerateClientToken(req: Request, res: Response) {
        try {
            const newToken = uuid();

            // @ts-ignore
            const updatedAccountDoc = await this.accountService.updateAccountClientToken(req?.user?._id, newToken);

            if (!updatedAccountDoc) {
                return failureResponse('Не удалось получить аккаунт для перегенерации токена', null, res);
            }

            successResponseWithoutMessage(newToken, res);
        } catch (error) {
            internalError(error, res);
        }
    }

    /**
     * Получение аккаунта по токену
     */
    public async getAccountByToken(req: Request, res: Response) {
        try {
            // @ts-ignore
            const { token }: { token: string } = req.params;

            const updatedAccountDoc = await this.accountService.getAccountByClientTokenId(token);

            if (!updatedAccountDoc) {
                return failureResponse(`Не удалось получить аккаунт по токену: ${token}`, null, res);
            }

            successResponseWithoutMessage(updatedAccountDoc.toObject(), res);
        } catch (error) {
            internalError(error, res);
        }
    }
}