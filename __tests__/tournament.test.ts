import {testServer} from "./common";
import {
    createTournamentReqBody,
    createdTournament,
    createdTournamentWithOnePlayer,
    createdTournamentWithTwoPlayer,
    deleteTournamentReqBody,
    otherTestMainGameParams,
    otherTournamentReqBodyWithIdentityName,
    registerFirstParticipantReqBody,
    registerSecondParticipantReqBody,
    startedTourWithFirstGame,
    testMainGamesParams,
    testUserRecordList,
    testWinnerRequestBody,
    secondGameFirstRequestFirstPlayer,
    secondGameFirstRequestSecondPlayer,
    secondGameSecondRequest,
    secondGameThirdRequestBody,
    startedTourWithSecondGame,
} from "./constants";
import {TournamentModel} from "../src/modules/tournament/tournament-schema";
import {AccountModel} from "../src/modules/account/account-schema";
import {ITournament} from "../src/modules/tournament";
import {GameModel} from "../src/modules/game";
import {omit} from "lodash";

describe("Запросы на управление турнирными записями", () => {
    const clearCollections = async () => {
        await TournamentModel.deleteMany({});
        await AccountModel.deleteMany({});
        await GameModel.deleteMany({});
    }

    beforeAll(clearCollections);
    afterAll(clearCollections);

    describe("POST /api/tournament/create", () => {
        it("Создание нового турнира", async () => {
            const res = await testServer.post("/api/tournament/create").send(createTournamentReqBody);

            expect(res.body.MESSAGE).toEqual('Турнир успешно создан');

            const savedRecord = await TournamentModel.findById(res.body?.DATA?._id);

            expect(savedRecord.toObject()).toEqual(createdTournament);
        }, 5000);

        it("Попытка создания турнира с похожим названием", async () => {
            const res = await testServer.post("/api/tournament/create").send(otherTournamentReqBodyWithIdentityName);

            expect(res.body.MESSAGE).toEqual('Турнир с таким названием уже зарегистрирован');
        }, 5000);

        it("Удаление турнира", async () => {
            const res = await testServer.post("/api/tournament/delete").send(deleteTournamentReqBody);

            expect(res.body.MESSAGE).toEqual('Турнир успешно удален');

            const savedRecord = await TournamentModel.findById(res.body?.DATA?._id);

            expect(savedRecord).toEqual(null);
        }, 5000);

        it("Создание турнира для обычного процесса", async () => {
            const res = await testServer.post("/api/tournament/create").send(createTournamentReqBody);

            expect(res.body.MESSAGE).toEqual('Турнир успешно создан');

            const savedRecord = await TournamentModel.findById(res.body?.DATA?._id);

            expect(savedRecord.toObject()).toEqual(createdTournament);
        }, 5000);

        it("Регистрация первого пользователя на турнир", async () => {
            await AccountModel.insertMany(testUserRecordList);

            const res = await testServer.post("/api/tournament/register").send(registerFirstParticipantReqBody);

            expect(res.body.MESSAGE).toEqual('Игрок успешно зарегистрирован');

            const createdTournamentDoc: ITournament | null = await TournamentModel.findById(createdTournament._id);

            expect(createdTournamentDoc?.toObject()).toEqual(createdTournamentWithOnePlayer);
        }, 5000);

        it("Регистрация второго пользователя на турнир, завершение регистрации, формирование сетки", async () => {
            const res = await testServer.post("/api/tournament/register").send(registerSecondParticipantReqBody);

            expect(res.body.MESSAGE).toEqual('Игрок успешно зарегистрирован');

            const createdTournamentDoc: ITournament | null = await TournamentModel.findById(createdTournament._id);

            const createdTour = createdTournamentDoc?.toObject();

            expect(omit(createdTour, 'grid[0].games')).toEqual(createdTournamentWithTwoPlayer);
        }, 5000);

        it("Первая игра между участниками", async () => {
            const res1 = await testServer.post("/api/save-game-params").send(testMainGamesParams);

            expect(res1.body.MESSAGE).toEqual('Запись игры успешно создана');

            const res2 = await testServer.post("/api/save-game-params").send(otherTestMainGameParams);

            expect(res2.body.MESSAGE).toEqual('Запись игры успешно обновлена');

            const res3 = await testServer.post("/api/save-game-winner").send(testWinnerRequestBody);

            expect(res3.body.MESSAGE).toEqual('Финальные данные игры успешно записаны');

            const createdTournamentDoc: ITournament | null = await TournamentModel.findById(createdTournament._id);

            const createdTour = createdTournamentDoc?.toObject();

            expect(createdTour.grid[0].games.includes(res3.body?.DATA?._id)).toBeTruthy();
            expect(omit(createdTour, 'grid[0].games')).toEqual(startedTourWithFirstGame);
        }, 5000);

        it("Вторая игра между участниками + поражение через разрыв соединения", async () => {
            const res1 = await testServer.post("/api/save-game-params").send(secondGameFirstRequestFirstPlayer);

            expect(res1.body.MESSAGE).toEqual('Запись игры успешно создана');

            const res2 = await testServer.post("/api/save-game-params").send(secondGameFirstRequestSecondPlayer);

            expect(res2.body.MESSAGE).toEqual('Запись игры успешно обновлена');

            const res3 = await testServer.post("/api/save-game-winner").send(secondGameSecondRequest);

            expect(res3.body.MESSAGE).toEqual('Финальные данные игры успешно записаны');

            const res4 = await testServer.post("/api/set-game-disconnect-status").send(secondGameThirdRequestBody);

            expect(res4.body.MESSAGE).toEqual('Подтверждение игроком статуса разрыва соединения успешно');

            const createdTournamentDoc: ITournament | null = await TournamentModel.findById(createdTournament._id);

            const createdTour = createdTournamentDoc?.toObject();

            expect(createdTour.grid[0].games.includes(res3.body?.DATA?._id)).toBeTruthy();
            expect(omit(createdTour, 'grid[0].games')).toEqual(startedTourWithSecondGame);
        }, 5000);
    });
})
