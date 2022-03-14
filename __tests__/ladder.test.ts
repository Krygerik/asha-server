import {AccountModel} from "../src/modules/account/account-schema";
import {LadderModel} from "../src/modules/ladder/ladder-schema";
import {testServer} from "./common";
import {testUserRecordList} from './constants';

describe("Ладдерные запросы", () => {
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

            await AccountModel.deleteMany({});
            await LadderModel.deleteMany({});
        });
    })
});