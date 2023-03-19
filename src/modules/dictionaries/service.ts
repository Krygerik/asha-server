import {
    ArtifactsModel,
    CreaturesModel,
    HeroesModel,
    PerksModel,
    RacesModel,
    SkillsModel,
    SpellsModel,
    WarMachinesModel,
    ChangedArtifactsModel,
    ChangedCreaturesModel,
    ChangedHeroesModel,
    ChangedPerksModel,
    ChangedRacesModel,
    ChangedSkillsModel,
    ChangedSpellsModel,
    ChangedWarMachinesModel,
} from "./schema";
import { EDictionariesNames, aggregateSubjectText } from "./constants";
import {IMapVersionValue} from "../map-version/map-version-model";

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

    public async getAllChangedDictionaries(map) {
        const allChangedDictionaries = await Promise.all(
            Object.values(DictionariesService.mapChangedDictionaryNameToModel).map(
                    model => model.aggregate(aggregateSubjectText(map))
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

    public async getAllGameID(map: IMapVersionValue, dictionary: EDictionariesNames) {
        const model = DictionariesService.mapChangedDictionaryNameToModel[dictionary]
    }

    public getGameID(map: IMapVersionValue, ID: String, dictionary: EDictionariesNames) {
        const model = DictionariesService.mapChangedDictionaryNameToModel[dictionary]
        let res = model.aggregate([
        {$graphLookup:{
            from: "map-tests",
            startWith: "$map",
            connectFromField: "map",
            connectToField: "parent",
            as: "arr",
            },
        },
        {$match: {
            $or: [{
                arr: {
                    $elemMatch: {
                        map: map,
                    },
                    },
                }, {
                map: map,
                }],
            },
        },
        {$addfields: {
            arr_size: {$size: "$arr" }
            }
        },
        {$sort: {
            game_id: 1,
            arr_size: 1,
            },
        },
        {$group: {
            _id: {game_id: "$game_id"},
            changed_id: {$first: "$changed_id"},
            },
        },
        {$match: {
            changed_id: {$elemMatch: {$eq: ID}}
            }
        }])
    
        if (!res[0]._id) {
            return ID
        } else {
            return res[0]._id
        }
    }
}