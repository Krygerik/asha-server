import {Request, Response} from "express";
import {
    failureResponse,
    internalError,
    successResponse,
} from "../modules/common/services";
import {
    AuthService,
    IUpdateUserGameInfoRequestBody,
    IUpdateUserInfoRequestBody,
} from "../modules/auth";
import {TournamentService} from "../modules/tournament";

export class AuthController {
    private authService: AuthService = new AuthService();
    private tournamentService: TournamentService = new TournamentService();


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

    /**
     * Обновление ника и дискорда игрока
     */
    public async updateUserInfo(req: Request, res: Response) {
        try {
            const { id, discord, nickname }: IUpdateUserInfoRequestBody = req.body;

            if (!discord && !nickname || !id) {
                return failureResponse('Отсутствуют данные для изменения', null, res);
            }

            await this.authService.updateUserInfo(id, discord, nickname);

            successResponse(
                'Никнейм или дискорд успешно изменены',
                { id, discord, nickname },
                res
            );
        } catch (error) {
            internalError(error, res);
        }
    }

    /**
     * Обновление игровых данных игрока
     */
    public async updateUserGameInfo(req: Request, res: Response) {
        try {
            const { id, original_rating }: IUpdateUserGameInfoRequestBody = req.body;

            if (!id || !original_rating) {
                return failureResponse('Отсутствуют данные для изменения', null, res);
            }

            await this.authService.updateUserGameInfo(id, original_rating);

            successResponse(
                'Начальный рейтинг игроков успешно изменен',
                { id, original_rating },
                res
            );
        } catch (error) {
            internalError(error, res);
        }
    }

    /**
     * Удаление игрока и всех его связей
     */
    public async deleteAllUserDataAndLinks(req: Request, res: Response) {
        try {
            const { id }: { id?: string } = req.body;

            if (!id) {
                return failureResponse('Отсутствуют необходимые данные', null, res);
            }

            await this.authService.deleteUser(id);
            await this.tournamentService.removeParticipantFromAllNotStartedTournament(id);

            successResponse(
                'Данные игрока успешно удалены',
                { id },
                res
            );
        } catch (error) {
            internalError(error, res);
        }
    }
}