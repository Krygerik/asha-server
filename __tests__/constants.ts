import { ObjectId } from 'mongodb';
import { omit } from 'lodash';
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

const commonTestMainGamesParams = {
    combat_id: '1',
    map_version: '1',
    players: [
        {
            army: [{
                count: 1,
                name: 'ID1',
            }],
            arts: ['ID1'],
            attack: 1,
            color: 1,
            defence: 1,
            hero: 'Maeve',
            knowledge: 1,
            level: 1,
            luck: 1,
            mana_start: 1,
            mentoring: 1,
            morale: 1,
            perks: ['ID1'],
            race: 'Haven',
            skills: ['ID1'],
            spell_power: 1,
            spells: ['ID1'],
            start_bonus: 'art',
            war_machines: ['ID1'],
        },
        {
            army: [{
                count: 2,
                name: 'ID2',
            }],
            arts: ['ID2'],
            attack: 2,
            color: 2,
            defence: 2,
            hero: 'Godric',
            knowledge: 2,
            level: 2,
            luck: 2,
            mana_start: 2,
            mentoring: 2,
            morale: 2,
            perks: ['ID2'],
            race: 'Haven',
            skills: ['ID2'],
            spell_power: 2,
            spells: ['ID2'],
            start_bonus: 'art',
            war_machines: ['ID2'],
        },
    ],
};

export const testMainGamesParams = {
    ...commonTestMainGamesParams,
    userId: '1',
};

export const otherTestMainGameParams = {
    ...commonTestMainGamesParams,
    userId: '2',
};

const commonTestCreatedGameRecord = {
    ...omit(testMainGamesParams, ['userId', 'players']),
    disconnect: false,
    disconnect_confirmed: false,
    players: testMainGamesParams.players.map(item => ({
        ...item,
        army_remainder: [],
        winner: false,
    })),
    waiting_for_disconnect_status: false,
};

export const testCreatedGameRecords = {
    ...commonTestCreatedGameRecord,
    players_ids: [testMainGamesParams.userId],
};

export const populateCreatedGameRecords = {
    ...commonTestCreatedGameRecord,
    players_ids: [testMainGamesParams.userId, otherTestMainGameParams.userId],
};

const commonTestWinnerRequestBody = {
    army_remainder: [{
        count: 1,
        name: 'ID1',
    }],
    combat_id: '1',
    date: new Date().toString(),
    isRedPlayer: true,
    percentage_of_army_left: 1,
    userId: '1',
    winner: 1,
};

export const testWinnerRequestBody = {
    ...commonTestWinnerRequestBody,
    wasDisconnect: false,
};

export const testWinnerRequestBodyWithDisconnect = {
    ...commonTestWinnerRequestBody,
    wasDisconnect: true,
};

const commonCreatedGameWithWinner = {
    ...populateCreatedGameRecords,
    date: testWinnerRequestBody.date,
    percentage_of_army_left: testWinnerRequestBody.percentage_of_army_left,
    players: populateCreatedGameRecords.players.map(
        player => ({
            ...player,
            ...(
                player.color === testWinnerRequestBody.winner
                    ? {
                        army_remainder: testWinnerRequestBody.army_remainder,
                        user_id: '1',
                        winner: true,
                    }
                    : {
                        army_remainder: [],
                        user_id: '2',
                        winner: false,
                    }
            ),
        })
    ),
    winner: testWinnerRequestBody.winner,
};

export const createdGameWithWinner = {
    ...commonCreatedGameWithWinner,
    waiting_for_disconnect_status: false,
};

export const createdGameWithWinnerAndDisconnect = {
    ...commonCreatedGameWithWinner,
    waiting_for_disconnect_status: true,
};

const commonSetDisconnectStatusReqBody = {
    combat_id: '1',
    userId: '1',
}

export const testSetDisconnectStatusReqBody = {
    ...commonSetDisconnectStatusReqBody,
    IsDisconnect: false,
};

export const setDisconnectStatusAsTrueReqBody = {
    ...commonSetDisconnectStatusReqBody,
    IsDisconnect: true,
};

export const createdGameWithWinnerAndDisconnected = {
    ...commonCreatedGameWithWinner,
    disconnect: true,
};