import { ObjectId } from 'mongodb';
import { uuid } from 'uuidv4';
import {IAccount} from "../src/modules/account/account-types";
import { ILadderRecord } from '../src/modules/ladder';

const firstUserId = new ObjectId();
const secondUserId = new ObjectId();

export const testUserRecordList = [
    {
        _id: firstUserId,
        banned: false,
        clientConnectId: uuid(),
        create_date: new Date(),
        discordId: uuid(),
        discriminator: '1111',
        merged_with_old_account: false,
        rating: 1222,
        tournaments: [],
        username: 'Pepe',
    },
    {
        _id: secondUserId,
        banned: false,
        clientConnectId: uuid(),
        create_date: new Date(),
        discordId: uuid(),
        discriminator: '1112',
        merged_with_old_account: false,
        rating: 1223,
        tournaments: [],
        username: 'Pepewka',
    }
] as IAccount[];

export const testLadderRecord: ILadderRecord = {
    _id: new ObjectId(),
    active: true,
    game_ids: [],
    // @ts-ignore
    member_ids: [firstUserId, secondUserId],
};
