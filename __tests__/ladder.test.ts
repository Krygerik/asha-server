import {AccountModel} from "../src/modules/account/account-schema";
import {LadderModel} from "../src/modules/ladder/ladder-schema";
import {testServer} from "./common";
import {testLadderRecord, testUserRecordList} from './constants';

describe("Ладдерные запросы", () => {
    beforeEach(async () => {
        await AccountModel.deleteMany({});
        await LadderModel.deleteMany({});
    })

    afterEach(async () => {
        await AccountModel.deleteMany({});
        await LadderModel.deleteMany({});
    })

    describe("POST /api/ladder/create", () => {
        it("Недостаточно участников для создания встречи", async () => {
            const res = await testServer.post("/api/ladder/create").send({discord_ids: []});

            expect(res.body.MESSAGE).toEqual('not_enough_data');
        });

        it("Создание рейтинговой встречи", async () => {
            await AccountModel.insertMany(testUserRecordList);

            const res = await testServer
                .post("/api/ladder/create")
                .send({
                    discord_ids: ['Pepe#1111', "Pepewka#1112"]
                });

            expect(res.body.MESSAGE).toEqual('ladder_successfully_created');

            const ladderInDB = await LadderModel.findById(res.body.DATA._id);

            expect(ladderInDB).not.toBeNull();
        });
    })

    describe("POST /api/ladder/cancel", () => {
        it("Завершение ладдерной встречи", async () => {
            await AccountModel.insertMany(testUserRecordList);
            await LadderModel.insertMany([testLadderRecord]);

            const res = await testServer
                .post("/api/ladder/cancel")
                .send({
                    discord_id: 'Pepe#1111'
                });

            expect(res.body.MESSAGE).toEqual('ladder_successfully_close');

            const closedLadderInDB = await LadderModel.findById(testLadderRecord._id);

            expect(closedLadderInDB).not.toBeNull();
            expect(closedLadderInDB?.active).toBeFalsy();
        });
    })
});