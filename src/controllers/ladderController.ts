import {Request, Response} from "express";
import {
    CANCEL_LADDER_RESPONSE_MESSAGES,
    CREATE_LADDER_RESPONSE_MESSAGES,
    ILadderRecord,
    LadderService,
} from "../modules/ladder";
import {failureResponse, internalError, successResponse} from "../modules/common/services";
import {AccountService} from "../modules/account";

export class LadderController {
    private accountService: AccountService = new AccountService();
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

            const userIds: { _id: string }[] = await Promise.all(
                discord_ids.map((discordData: string) => {
                    const [username, discriminator] = discordData.split('#');

                    return this.accountService.getUserIdByDiscordData(username, discriminator);
                })
            );

            if (userIds.length > 2) {
                return failureResponse(
                    CREATE_LADDER_RESPONSE_MESSAGES.ERRORS.TOO_MUCH_PLAYERS_WITH_SUCH_DATA,
                    { userIds },
                    res
                );
            }

            const savedRecord = await this.ladderService.createLadder({
                active: true,
                game_ids: [],
                member_ids: userIds.map(user => user._id),
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

            const [username, discriminator] = discord_id.split('#');

            const usersId = await this.accountService.getUserIdByDiscordData(username, discriminator);

            if (!usersId) {
                return failureResponse(
                    CANCEL_LADDER_RESPONSE_MESSAGES.ERROR.PLAYER_NOT_FOUND,
                    null,
                    res,
                );
            }

            const activeLadder: ILadderRecord | null = await this.ladderService.getActiveLadderByUserId(usersId._id);

            if (!activeLadder) {
                return successResponse(
                    CANCEL_LADDER_RESPONSE_MESSAGES.SUCCESS.PLAYER_HAS_NO_LADDER,
                    null,
                    res,
                );
            }

            const closedLadder = await this.ladderService.closeLadderRound(activeLadder._id);

            return successResponse(
                CANCEL_LADDER_RESPONSE_MESSAGES.SUCCESS.LADDER_SUCCESSFULLY_CLOSE,
                closedLadder,
                res,
            );
        } catch (error) {
            internalError(error, res);
        }
    }
}