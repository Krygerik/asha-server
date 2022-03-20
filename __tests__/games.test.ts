import { omit } from "lodash";
import {GameModel} from "../src/modules/game";
import {testServer} from "./common";
import {
    otherTestMainGameParams,
    populateCreatedGameRecords,
    testCreatedGameRecords,
    testMainGamesParams,
} from "./constants";

describe("Запросы на управление игровыми записями", () => {
    const clearCollections = async () => {
        await GameModel.deleteMany({});
    }

    beforeAll(clearCollections);
    afterAll(clearCollections);

    describe("POST /api/save-game-params", () => {
        it("Создание новой записи игры", async () => {
            const res = await testServer.post("/api/save-game-params").send(testMainGamesParams);

            expect(res.body.MESSAGE).toEqual('Запись игры успешно создана');

            const savedRecord = await GameModel.findById(res.body?.DATA?._id);

            expect(omit(savedRecord.toObject(), ['_id'])).toEqual(testCreatedGameRecords);
        }, 5000)


        it("Повторная попытка создания записи игры", async () => {
            const res = await testServer.post("/api/save-game-params").send(testMainGamesParams);

            expect(res.body.MESSAGE).toEqual('Игрок уже записан в запись игры');

            const savedRecord = await GameModel.findById(res.body?.DATA?._id);

            expect(omit(savedRecord.toObject(), ['_id'])).toEqual(testCreatedGameRecords);
        }, 5000)

        it("Добавление данных от второго игрока", async () => {
            const res = await testServer.post("/api/save-game-params").send(otherTestMainGameParams);

            expect(res.body.MESSAGE).toEqual('Запись игры успешно обновлена');

            const savedRecord = await GameModel.findById(res.body?.DATA?._id);

            expect(omit(savedRecord.toObject(), ['_id'])).toEqual(populateCreatedGameRecords);
        }, 5000)

        it("Повторная попытка добавление данных от второго игрока", async () => {
            const res = await testServer.post("/api/save-game-params").send(otherTestMainGameParams);

            expect(res.body.MESSAGE).toEqual('Игрок уже записан в запись игры');

            const savedRecord = await GameModel.findById(res.body?.DATA?._id);

            expect(omit(savedRecord.toObject(), ['_id'])).toEqual(populateCreatedGameRecords);
        })
    })
})
