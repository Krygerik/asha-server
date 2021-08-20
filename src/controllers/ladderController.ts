import {Request, Response} from "express";
import {LadderService} from "../modules/ladder";
import {failureResponse, internalError, successResponse} from "../modules/common/services";
import {AuthService} from "../modules/auth";

export class LadderController {
    private authService: AuthService = new AuthService();
    private ladderService: LadderService = new LadderService();

    /**
     * Создание рейтинговой встречи
     */
    public async createLadder(req: Request, res: Response) {
        try {
            const { discord_ids } = req.body;

            if (!discord_ids) {
                return failureResponse('Отсутствуют данные о игроках', null, res);
            }
            if (discord_ids.length < 2) {
                return failureResponse('Недостаточно данных о игроках', null, res);
            }

            // @ts-ignore
            const member_ids: string[] = await this.authService.getUserIdsByDiscordId(discord_ids);

            if (member_ids.length > 2) {
                return failureResponse('Игроков с такими данными больше 2', { member_ids }, res);
            }

            const savedRecord = await this.ladderService.createLadder({
                active: true,
                game_ids: [],
                member_ids,
            });

            successResponse(
                'Рейтинговая встреча успешно создана',
                savedRecord,
                res,
            );
        } catch (error) {
            internalError(error, res);
        }
    }
}