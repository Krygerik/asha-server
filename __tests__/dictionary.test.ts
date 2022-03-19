import {
    ArtifactsModel,
    CreaturesModel,
    HeroesModel,
    PerksModel,
    RacesModel,
    SkillsModel,
    SpellsModel,
    WarMachinesModel,
} from "../src/modules/dictionaries/schema";
import {testAllDictionaries} from "./constants";
import {testServer} from "./common";

describe("Запросы словарей", () => {
    const clearCollections = async () => {
        await ArtifactsModel.deleteMany({});
        await CreaturesModel.deleteMany({});
        await HeroesModel.deleteMany({});
        await PerksModel.deleteMany({});
        await RacesModel.deleteMany({});
        await SkillsModel.deleteMany({});
        await SpellsModel.deleteMany({});
        await WarMachinesModel.deleteMany({});
    }

    beforeAll(clearCollections);
    afterAll(clearCollections);

    describe("GET /api/get-dictionaries", () => {
        it("Получение всех игровых справочников", async () => {
            await ArtifactsModel.insertMany(testAllDictionaries.artifacts);
            await CreaturesModel.insertMany(testAllDictionaries.creatures);
            await HeroesModel.insertMany(testAllDictionaries.heroes);
            await PerksModel.insertMany(testAllDictionaries.perks);
            await RacesModel.insertMany(testAllDictionaries.races);
            await SkillsModel.insertMany(testAllDictionaries.skills);
            await SpellsModel.insertMany(testAllDictionaries.spells);
            await WarMachinesModel.insertMany(testAllDictionaries['war-machines']);

            const res = await testServer.get("/api/get-dictionaries");

            expect(res.body.MESSAGE).toEqual('Список всех словарей игровых данных успешно получен');
            expect(res.body.DATA).toEqual(testAllDictionaries);
        });
    })
})