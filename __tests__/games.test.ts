import { omit } from "lodash";
import {GameModel} from "../src/modules/game";
import {testServer} from "./common";
import {
    createdGameWithWinner,
    createdGameWithWinnerAndDisconnect,
    createdGameWithWinnerAndDisconnected,
    otherCommonCreatedGameWithWinner,
    otherTestMainGameParams,
    otherWinnerRequestBody,
    populateCreatedGameRecords,
    setDisconnectStatusAsTrueReqBody,
    testCreatedGameRecords,
    testMainGamesParams,
    testSetDisconnectStatusReqBody,
    testWinnerRequestBody,
    testWinnerRequestBodyWithDisconnect,
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
        }, 5000)
    })

    describe("POST /api/save-game-winner", () => {
        it("Сохранение победителя и определение красного игрока", async () => {
            const res = await testServer.post("/api/save-game-winner").send(testWinnerRequestBody);

            expect(res.body.MESSAGE).toEqual('Финальные данные игры успешно записаны');

            const savedRecord = await GameModel.findById(res.body?.DATA?._id);

            expect(omit(savedRecord.toObject(), ['_id'])).toEqual(createdGameWithWinner);
        })
    })

    describe("Простой процесс игры с разрывом соединения по причине сдачи игрока", () => {
        it("Создание новой записи игры", async () => {
            await clearCollections();

            const res = await testServer.post("/api/save-game-params").send(testMainGamesParams);

            expect(res.body.MESSAGE).toEqual('Запись игры успешно создана');

            const savedRecord = await GameModel.findById(res.body?.DATA?._id);

            expect(omit(savedRecord.toObject(), ['_id'])).toEqual(testCreatedGameRecords);
        }, 5000)

        it("Запись данных от второго игрока", async () => {
            const res = await testServer.post("/api/save-game-params").send(otherTestMainGameParams);

            expect(res.body.MESSAGE).toEqual('Запись игры успешно обновлена');

            const savedRecord = await GameModel.findById(res.body?.DATA?._id);

            expect(omit(savedRecord.toObject(), ['_id'])).toEqual(populateCreatedGameRecords);
        }, 5000)

        it("Запись победителя и статус соединения", async () => {
            const res = await testServer.post("/api/save-game-winner").send(testWinnerRequestBodyWithDisconnect);

            expect(res.body.MESSAGE).toEqual('Финальные данные игры успешно записаны');

            const savedRecord = await GameModel.findById(res.body?.DATA?._id);

            expect(omit(savedRecord.toObject(), ['_id'])).toEqual(createdGameWithWinnerAndDisconnect);
        }, 5000)

        it("Подтверждение статуса разрыва соединения игроком", async () => {
            const res = await testServer.post("/api/set-game-disconnect-status").send(testSetDisconnectStatusReqBody);

            const savedRecord = await GameModel.findById(res.body?.DATA?._id);

            expect(omit(savedRecord.toObject(), ['_id'])).toEqual(createdGameWithWinner);
        }, 5000)
    })

    describe("Простой процесс игры с разрывом соединения без переигровки", () => {
        it("Создание новой записи игры", async () => {
            await clearCollections();

            const res = await testServer.post("/api/save-game-params").send(testMainGamesParams);

            expect(res.body.MESSAGE).toEqual('Запись игры успешно создана');

            const savedRecord = await GameModel.findById(res.body?.DATA?._id);

            expect(omit(savedRecord.toObject(), ['_id'])).toEqual(testCreatedGameRecords);
        }, 5000)

        it("Запись данных от второго игрока", async () => {
            const res = await testServer.post("/api/save-game-params").send(otherTestMainGameParams);

            expect(res.body.MESSAGE).toEqual('Запись игры успешно обновлена');

            const savedRecord = await GameModel.findById(res.body?.DATA?._id);

            expect(omit(savedRecord.toObject(), ['_id'])).toEqual(populateCreatedGameRecords);
        }, 5000)

        it("Запись победителя и статус соединения", async () => {
            const res = await testServer.post("/api/save-game-winner").send(testWinnerRequestBodyWithDisconnect);

            expect(res.body.MESSAGE).toEqual('Финальные данные игры успешно записаны');

            const savedRecord = await GameModel.findById(res.body?.DATA?._id);

            expect(omit(savedRecord.toObject(), ['_id'])).toEqual(createdGameWithWinnerAndDisconnect);
        }, 5000)

        it("Подтверждение статуса разрыва соединения игроком", async () => {
            const res = await testServer.post("/api/set-game-disconnect-status").send(setDisconnectStatusAsTrueReqBody);

            const savedRecord = await GameModel.findById(res.body?.DATA?._id);

            expect(omit(savedRecord.toObject(), ['_id'])).toEqual(createdGameWithWinnerAndDisconnected);
        }, 5000)
    })

    describe("Перезапись игровых данных при переигровке матча с разрывом соединения", () => {
        it("Создание новой записи игры", async () => {
            await clearCollections();

            const res = await testServer.post("/api/save-game-params").send(testMainGamesParams);

            expect(res.body.MESSAGE).toEqual('Запись игры успешно создана');
        }, 5000)

        it("Запись данных от второго игрока", async () => {
            const res = await testServer.post("/api/save-game-params").send(otherTestMainGameParams);

            expect(res.body.MESSAGE).toEqual('Запись игры успешно обновлена');
        }, 5000)

        it("Запись победителя и статус соединения", async () => {
            const res = await testServer.post("/api/save-game-winner").send(testWinnerRequestBodyWithDisconnect);

            expect(res.body.MESSAGE).toEqual('Финальные данные игры успешно записаны');
        }, 5000)

        it("Подтверждение статуса разрыва соединения игроком", async () => {
            const res = await testServer.post("/api/set-game-disconnect-status").send(setDisconnectStatusAsTrueReqBody);

            expect(res.body.MESSAGE).toEqual('Подтверждение игроком статуса разрыва соединения успешно');
        }, 5000)

        it("Повторная отправка данных первым игроком на перезапись", async () => {
            const res = await testServer.post("/api/save-game-params").send(testMainGamesParams);

            expect(res.body.MESSAGE).toEqual('Игрок уже записан в запись игры');
        }, 5000)

        it("Повторная отправка данных вторым игроком на перезапись", async () => {
            const res = await testServer.post("/api/save-game-params").send(otherTestMainGameParams);

            expect(res.body.MESSAGE).toEqual('Игрок уже записан в запись игры');
        }, 5000)

        it("Сохранение новых результатов игры", async () => {
            const res = await testServer.post("/api/save-game-winner").send(otherWinnerRequestBody);

            expect(res.body.MESSAGE).toEqual('Финальные данные игры успешно записаны');

            const savedRecord = await GameModel.findById(res.body?.DATA?._id);

            expect(omit(savedRecord.toObject(), ['_id'])).toEqual(otherCommonCreatedGameWithWinner);
        }, 5000)
    })
})
