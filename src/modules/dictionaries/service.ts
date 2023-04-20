import {
    ArtifactsModel,
    ChangedArtifactsModel,
    ChangedCreaturesModel,
    ChangedHeroesModel,
    ChangedPerksModel,
    ChangedRacesModel,
    ChangedSkillsModel,
    ChangedSpellsModel,
    ChangedWarMachinesModel,
    CreaturesModel,
    HeroesModel,
    PerksModel,
    RacesModel,
    SkillsModel,
    SpellsModel,
    WarMachinesModel,
} from "./schema";
import { EDictionariesNames, aggregateSubjectText } from "./constants";

export class DictionariesService {
    /**
     * Соотношение названий словарей к моделям
     */
    static mapDictionaryNameToModel = {
        [EDictionariesNames.Artifacts]: ArtifactsModel,
        [EDictionariesNames.Creatures]: CreaturesModel,
        [EDictionariesNames.Heroes]: HeroesModel,
        [EDictionariesNames.Perks]: PerksModel,
        [EDictionariesNames.Races]: RacesModel,
        [EDictionariesNames.Skills]: SkillsModel,
        [EDictionariesNames.Spells]: SpellsModel,
        [EDictionariesNames.WarMachines]: WarMachinesModel,
    }

    static mapChangedDictionaryNameToModel = {
        [EDictionariesNames.Artifacts]: ChangedArtifactsModel,
        [EDictionariesNames.Creatures]: ChangedCreaturesModel,
        [EDictionariesNames.Heroes]: ChangedHeroesModel,
        [EDictionariesNames.Perks]: ChangedPerksModel,
        [EDictionariesNames.Races]: ChangedRacesModel,
        [EDictionariesNames.Skills]: ChangedSkillsModel,
        [EDictionariesNames.Spells]: ChangedSpellsModel,
        [EDictionariesNames.WarMachines]: ChangedWarMachinesModel,
    }

    /**
     * Получение конкретного справочника
     */
    public getDictionary(name: EDictionariesNames) {
        const model = DictionariesService.mapDictionaryNameToModel[name];

        return model.find({});
    }

    /**
     * Получение всех сохраненных в бд справочников
     */
    public async getAllDictionaries() {
        const allDictionaries = await Promise.all(
            Object.values(DictionariesService.mapDictionaryNameToModel).map(
                    model => model.find({})
            )
        );

        return Object.keys(DictionariesService.mapDictionaryNameToModel).reduce(
            (acc, dictionariesNames, index) => ({
                ...acc,
                [dictionariesNames]: allDictionaries[index],
            }),
            {},
        );
    }

    /**
     * update
     */
    public getUpdate(name: EDictionariesNames) {
        const model = DictionariesService.mapDictionaryNameToModel[name];
        return model.updateMany({});
    }

    public async getAllChangedDictionaries(mapType: string, mapVersion: string) {
        const allChangedDictionaries = await Promise.all(
            Object.values(DictionariesService.mapChangedDictionaryNameToModel).map(
                    model => model.aggregate(aggregateSubjectText(mapType, mapVersion))
            )
        );

        return Object.keys(DictionariesService.mapChangedDictionaryNameToModel).reduce(
            (acc, dictionariesNames, index) => ({
                ...acc,
                //@ts-ignore
                [dictionariesNames]: allChangedDictionaries[index],
            }),
            {},
        );
    }
}