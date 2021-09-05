import {Request, Response} from "express";
import {
    CANCEL_LADDER_RESPONSE_MESSAGES,
    CREATE_LADDER_RESPONSE_MESSAGES,
    ILadderRecord,
    LadderService,
} from "../modules/ladder";
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
                return failureResponse(CREATE_LADDER_RESPONSE_MESSAGES.ERRORS.NO_DATA, null, res);
            }
            if (discord_ids.length < 2) {
                return failureResponse(CREATE_LADDER_RESPONSE_MESSAGES.ERRORS.NOT_ENOUGH_DATA, null, res);
            }

            // @ts-ignore
            const member_ids: string[] = await this.authService.getUserIdsByDiscordId(discord_ids);

            if (member_ids.length > 2) {
                return failureResponse(
                    CREATE_LADDER_RESPONSE_MESSAGES.ERRORS.TOO_MUCH_PLAYERS_WITH_SUCH_DATA,
                    { member_ids },
                    res
                );
            }

            const savedRecord = await this.ladderService.createLadder({
                active: true,
                game_ids: [],
                member_ids,
            });

            successResponse(
                CREATE_LADDER_RESPONSE_MESSAGES.SUCCESS.LADDER_SUCCESSFULLY_CREATED,
                savedRecord,
                res,
            );
        } catch (error) {
            internalError(error, res);
        }
    }

    /**
     * Создание рейтинговой встречи
     */
    public async cancelLadder(req: Request, res: Response) {
        try {
            const { discord_id } = req.body;

            if (!discord_id) {
                return failureResponse(CANCEL_LADDER_RESPONSE_MESSAGES.ERROR.NO_DATA, null, res);
            }

            // @ts-ignore
            const member_ids: string[] = await this.authService.getUserIdsByDiscordId([discord_id]);

            if (member_ids.length === 0) {
                return failureResponse(
                    CANCEL_LADDER_RESPONSE_MESSAGES.ERROR.PLAYER_NOT_FOUND,
                    null,
                    res,
                );
            }

            // @ts-ignore
            const activeLadder: ILadderRecord = await this.ladderService.getActiveLadderByUserId(member_ids[0]);

            if (!activeLadder) {
                return successResponse(
                    CANCEL_LADDER_RESPONSE_MESSAGES.SUCCESS.PLAYER_HAS_NO_LADDER,
                    null,
                    res,
                );
            }

            await this.ladderService.closeLadderRound(activeLadder._id);

            return successResponse(
                CANCEL_LADDER_RESPONSE_MESSAGES.SUCCESS.LADDER_SUCCESSFULLY_CLOSE,
                null,
                res,
            );
        } catch (error) {
            internalError(error, res);
        }
    }
}