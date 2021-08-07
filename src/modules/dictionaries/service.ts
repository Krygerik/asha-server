import {
    ArtifactsModel,
    CreaturesModel,
    HeroesModel,
    PerksModel,
    RacesModel,
    SkillsModel,
    SpellsModel,
    WarMachinesModel,
} from "./schema";
import { EDictionariesNames } from "./constants";

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
}