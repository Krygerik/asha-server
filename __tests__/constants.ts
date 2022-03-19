import { ObjectId } from 'mongodb';
import { uuid } from 'uuidv4';
import {IAccount} from "../src/modules/account/account-types";
import { ILadderRecord } from '../src/modules/ladder';
// @ts-ignore
import * as artifacts from "../src/static_db_values/dictionaries/artifacts.json";
// @ts-ignore
import * as creatures from "../src/static_db_values/dictionaries/creatures.json";
// @ts-ignore
import * as heroes from "../src/static_db_values/dictionaries/heroes.json";
// @ts-ignore
import * as perks from "../src/static_db_values/dictionaries/perks.json";
// @ts-ignore
import * as races from "../src/static_db_values/dictionaries/races.json";
// @ts-ignore
import * as skills from "../src/static_db_values/dictionaries/skills.json";
// @ts-ignore
import * as spells from "../src/static_db_values/dictionaries/spells.json";
// @ts-ignore
import * as warMachines from "../src/static_db_values/dictionaries/warMachines.json";
// @ts-ignore
import * as mapVersions from "../src/static_db_values/dictionaries/map-versions.json";

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

/**
 * Добавление к элементу справочника поля Монго ИД
 */
const addingMongoId = (item: any) => ({
    ...item,
    _id: (new ObjectId()).toString()
});

export const testAllDictionaries = {
    artifacts: artifacts.map(addingMongoId),
    creatures: creatures.map(addingMongoId),
    heroes: heroes.map(addingMongoId),
    perks: perks.map(addingMongoId),
    races: races.map(addingMongoId),
    skills: skills.map(addingMongoId),
    spells: spells.map(addingMongoId),
    'war-machines': warMachines.map(addingMongoId),
};

export const testAshaDictionaries = {
    mapVersions: mapVersions.map(addingMongoId),
}