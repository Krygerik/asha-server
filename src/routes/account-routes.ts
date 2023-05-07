import {Application, Request, Response} from "express";
import * as passport from "passport";
import {AccountController} from "../controllers/account-controller";
import {ERoles} from "../modules/auth";

export class AccountRoutes {
    private accountController: AccountController = new AccountController();

    public route(app: Application) {
        /**
         * Регистрация пользователя в системе через дискорд
         */
        app.get('/api/account/discord-registration', passport.authenticate('discord'));

        /**
         * Редирект, после аутентификации в дискорде
         */
        app.get(
            '/api/account/discord-callback',
            passport.authenticate('discord', { failureRedirect: '/api/account/failed' }),
            this.accountController.redirectToClientRootPage,
        );

        // TODO: Переделать под отказ клиента от авторизации
        app.get('/api/account/failed', (req: Request, res: Response) => {
            res.status(401);
        });

        /**
         * Получение профиля игрока
         */
        app.get(
            '/api/account/get-profile',
            (req, res) => this.accountController.getProfile(req, res)
        );

        /**
         * Получение профиля других игроков
         */
        app.get(
            '/api/account/get-profile/:id',
            AccountController.isAuthorized,
            (req, res) => this.accountController.getProfile(req, res)
        );

        /**
         * Обновление личных данных пользователя
         */
        app.post(
            '/api/account/update-personal-info',
            AccountController.isAuthorized,
            (req, res) => this.accountController.updateAccountNickname(req, res)
        );

        /**
         * Обновление личных данных пользователя
         */
        app.post(
            '/api/account/update-game-info',
            AccountController.isAuthorized,
            (req, res) => this.accountController.updateUserGameInfo(req, res)
        );

        /**
         * Отказ пользователя от слияния аккаунтов
         */
        app.post(
            '/api/account/cancel-account-merging',
            AccountController.isAuthorized,
            (req, res) => this.accountController.cancelAccountMerging(req, res)
        );

        /**
         * Слияние аккаунтов
         */
        app.post(
            '/api/account/merge-accounts',
            AccountController.isAuthorized,
            (req, res) => this.accountController.mergingOldAccount(req, res)
        );

        /**
         * Бан аккаунта
         */
        app.post(
            '/api/account/change-ban-status',
            [
                AccountController.isAuthorized,
                AccountController.accessByRoles([ERoles.ADMIN])
            ],
            (req, res) => this.accountController.changeAccountBanStatus(req, res)
        );

        /**
         * Получение списка пользователей с ID и никнеймом всех зарегистрированных игроков
         */
        app.get(
            '/api/account/get-all-id-with-nicknames',
            (req, res) => this.accountController.getAllUsersList(req, res),
        )

        /**
         * Получение список аккаунтов по рейтингу
         */
        app.get(
            '/api/account/get-player-rating-list',
            (req: Request, res: Response) => this.accountController.getTopRatingUserList(req, res)
        );

        /**
         * Получение токена доступа к клиенту
         */
        app.get(
            '/api/account/get-client-token',
            AccountController.isAuthorized,
            (req: Request, res: Response) => this.accountController.getClientToken(req, res)
        );

        /**
         * Перегенерация токена доступа
         */
        app.get(
            '/api/account/regenerate-client-token',
            AccountController.isAuthorized,
            (req: Request, res: Response) => this.accountController.regenerateClientToken(req, res)
        );

        /**
         * Получение аккаунта по клиентскому токену
         */
        app.get(
            '/api/account/get-account-by-token/:token',
            (req: Request, res: Response) => this.accountController.getAccountByToken(req, res)
        )
    }
}