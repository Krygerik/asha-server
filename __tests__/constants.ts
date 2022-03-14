import { ObjectId } from 'mongodb';
import { uuid } from 'uuidv4';
import {IAccount} from "../src/modules/account/account-types";

export const testUserRecordList = [
    {
        _id: new ObjectId(),
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
        _id: new ObjectId(),
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
