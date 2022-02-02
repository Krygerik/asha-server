import {Application, Request, Response} from "express";
import { intersection } from "lodash";
import * as passport from "passport";
import {AccountController} from "../controllers/account-controller";
import {failureResponse} from "../modules/common/services";
import {ERoles} from "../modules/auth";

export class AccountRoutes {
    private accountController: AccountController = new AccountController();

    /**
     * Мидлвара только для зареганных
     */
    private static isAuthorized(req, res, next) {
        if(!req.user) {
            return failureResponse('Пользователь не авторизован!', null, res);
        }

        next();
    }

    /**
     * Мидлвара доступа только по ролям
     */
    private static accessByRoles(roles: string[]) {
        return function (req, res, next) {
            const matchedRolesList = intersection(roles, req.user.roles);

            if (matchedRolesList.length === 0) {
                return failureResponse('Пользователь не имеет необходимой роли!', null, res);
            }

            next();
        }
    }

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
            AccountRoutes.isAuthorized,
            (req, res) => this.accountController.getProfile(req, res)
        );

        /**
         * Обновление личных данных пользователя
         */
        app.post(
            '/api/account/update-personal-info',
            AccountRoutes.isAuthorized,
            (req, res) => this.accountController.updateAccountNickname(req, res)
        );

        /**
         * Обновление личных данных пользователя
         */
        app.post(
            '/api/account/update-game-info',
            AccountRoutes.isAuthorized,
            (req, res) => this.accountController.updateUserGameInfo(req, res)
        );

        /**
         * Отказ пользователя от слияния аккаунтов
         */
        app.post(
            '/api/account/cancel-account-merging',
            AccountRoutes.isAuthorized,
            (req, res) => this.accountController.cancelAccountMerging(req, res)
        );

        /**
         * Слияние аккаунтов
         */
        app.post(
            '/api/account/merge-accounts',
            AccountRoutes.isAuthorized,
            (req, res) => this.accountController.mergingOldAccount(req, res)
        );

        /**
         * Бан аккаунта
         */
        app.post(
            '/api/account/change-ban-status',
            [
                AccountRoutes.isAuthorized,
                AccountRoutes.accessByRoles([ERoles.ADMIN])
            ],
            (req, res) => this.accountController.changeAccountBanStatus(req, res)
        );

        /**
         * Получение списка пользователей с ID и никнеймом всех зарегистрированных игроков
         */
        app.get('/api/account/get-account', (req, res) => this.accountController.getAllUsersList(req, res))

        /**
         * Получение список аккаунтов по рейтингу
         */
        app.get(
            '/api/account/get-player-rating-list',
            (req: Request, res: Response) => this.accountController.getTopRatingUserList(req, res)
        );
    }
}