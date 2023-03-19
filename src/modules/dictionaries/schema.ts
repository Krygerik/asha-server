import * as mongoose from "mongoose";
import {EDictionariesNames} from "./constants";
import {MapVersionValueSchema} from "../map-version/map-version-schema";

const mapToChangedNames = {
        [EDictionariesNames.Artifacts]: 'changed-artifacts',
        [EDictionariesNames.Creatures]: 'changed-creatures',
        [EDictionariesNames.Heroes]: 'changed-heroes',
        [EDictionariesNames.Perks]: 'changed-perks',
        [EDictionariesNames.Races]: 'changed-races',
        [EDictionariesNames.Skills]: 'changed-skills',
        [EDictionariesNames.Spells]: 'changed-spells',
        [EDictionariesNames.WarMachines]: 'changed-machines',
    }

/**
 * Локализованные названия
 */
const LocalizationSchema = new mongoose.Schema(
    {
        en: {
            required: true,
            type: String,
        },
        ru: {
            required: true,
            type: String,
        },
    },
    { _id : false }
);

/**
 * Схема одной записи справочника "Заклинания"
 */
const SpellsRecordSchema = new mongoose.Schema({
    game_id: {
        type: String,
        required: true
    },
    localize_name: LocalizationSchema
}, { versionKey: false });

export const SpellsModel = mongoose.model(EDictionariesNames.Spells, SpellsRecordSchema);

/**
 * Схема одной записи справочника "Школы"
 */
const SkillsRecordSchema = new mongoose.Schema({
    game_id: {
        type: String,
        required: true
    },
    localize_name: LocalizationSchema
}, { versionKey: false });

export const SkillsModel = mongoose.model(EDictionariesNames.Skills, SkillsRecordSchema);

/**
 * Схема одной записи справочника "Навыки"
 */
const PerksRecordSchema = new mongoose.Schema({
    game_id: {
        type: String,
        required: true
    },
    localize_name: LocalizationSchema,
}, { versionKey: false });

export const PerksModel = mongoose.model(EDictionariesNames.Perks, PerksRecordSchema);

/**
 * Схема одной записи справочника "Герои"
 */
const HeroesRecordSchema = new mongoose.Schema({
    game_id: {
        type: String,
        required: true
    },
    localize_name: LocalizationSchema,
    race_game_id: {
        type: String,
        required: true
    }
}, { versionKey: false });

export const HeroesModel = mongoose.model(EDictionariesNames.Heroes, HeroesRecordSchema);

/**
 * Параметры существ
 */
const CreatureParametersSchema = new mongoose.Schema(
    {
        initiative: {
            type: Number,
            required: true
        }
    },
    { _id : false }
);

/**
 * Схема одной записи справочника "Артефакты"
 */
const ArtifactsRecordSchema = new mongoose.Schema(
    {
        game_id: {
            type: String,
            required: true
        },
        localize_name: LocalizationSchema,
    },
    { versionKey: false }
);

export const ArtifactsModel = mongoose.model(EDictionariesNames.Artifacts, ArtifactsRecordSchema);

/**
 * Схема одной записи справочника "Существа"
 */
const CreaturesRecordSchema = new mongoose.Schema({
    game_id: {
        type: String,
        required: true
    },
    localize_name: LocalizationSchema,
    parameters: CreatureParametersSchema,
}, { versionKey: false });

export const CreaturesModel = mongoose.model(EDictionariesNames.Creatures, CreaturesRecordSchema);

/**
 * Схема одной записи справочника "Расы"
 */
const RacesRecordSchema = new mongoose.Schema({
    game_id: {
        type: String,
        required: true
    },
    localize_name: LocalizationSchema,
}, { versionKey: false });

export const RacesModel = mongoose.model(EDictionariesNames.Races, RacesRecordSchema);

/**
 * Схема одной записи справочника "Боевые машины"
 */
const WarMachinesRecordSchema = new mongoose.Schema({
    game_id: {
        type: String,
        required: true
    },
    localize_name: LocalizationSchema,
}, { versionKey: false });

export const WarMachinesModel = mongoose.model(EDictionariesNames.WarMachines, WarMachinesRecordSchema);

/**
 * Схема одной записи справочника "Артефакты" с изменениями ИД
 */
const ChangedArtifactsSchema = new mongoose.Schema({
    map: MapVersionValueSchema,
    game_id: String,
    changed_id: [String],
    localize_name: LocalizationSchema
})

export const ChangedArtifactsModel = mongoose.model(mapToChangedNames[EDictionariesNames.Artifacts], ChangedArtifactsSchema);

/**
 * Схема одной записи справочника "Существа" с изменениями ИД
 */
const ChangedCreaturesSchema = new mongoose.Schema({
    map: MapVersionValueSchema,
    game_id: String,
    changed_id: [String],
    localize_name: LocalizationSchema
})

export const ChangedCreaturesModel = mongoose.model(mapToChangedNames[EDictionariesNames.Creatures], ChangedCreaturesSchema);

/**
 * Схема одной записи справочника "Герои" с изменениями ИД
 */
const ChangedHeroesSchema = new mongoose.Schema({
    map: MapVersionValueSchema,
    game_id: String,
    changed_id: [String],
    localize_name: LocalizationSchema
})

export const ChangedHeroesModel = mongoose.model(mapToChangedNames[EDictionariesNames.Heroes], ChangedHeroesSchema);

/**
 * Схема одной записи справочника "Навыки" с изменениями ИД
 */
const ChangedPerksSchema = new mongoose.Schema({
    map: MapVersionValueSchema,
    game_id: String,
    changed_id: [String],
    localize_name: LocalizationSchema
})

export const ChangedPerksModel = mongoose.model(mapToChangedNames[EDictionariesNames.Perks], ChangedPerksSchema);

/**
 * Схема одной записи справочника "Расы" с изменениями ИД
 */
const ChangedRacesSchema = new mongoose.Schema({
    map: MapVersionValueSchema,
    game_id: String,
    changed_id: [String],
    localize_name: LocalizationSchema
})

export const ChangedRacesModel = mongoose.model(mapToChangedNames[EDictionariesNames.Races], ChangedRacesSchema);

/**
 * Схема одной записи справочника "Школы" с изменениями ИД
 */
const ChangedSkillsSchema = new mongoose.Schema({
    map: MapVersionValueSchema,
    game_id: String,
    changed_id: [String],
    localize_name: LocalizationSchema
})

export const ChangedSkillsModel = mongoose.model(mapToChangedNames[EDictionariesNames.Skills], ChangedSkillsSchema);

/**
 * Схема одной записи справочника "Заклинания" с изменениями ИД
 */
const ChangedSpellsSchema = new mongoose.Schema({
    map: MapVersionValueSchema,
    game_id: String,
    changed_id: [String],
    localize_name: LocalizationSchema
})

export const ChangedSpellsModel = mongoose.model(mapToChangedNames[EDictionariesNames.Spells], ChangedSpellsSchema);

/**
 * Схема одной записи справочника "Боевые машины" с изменениями ИД
 */
const ChangedWarMachinesSchema = new mongoose.Schema({
    map: MapVersionValueSchema,
    game_id: String,
    changed_id: [String],
    localize_name: LocalizationSchema
})

export const ChangedWarMachinesModel = mongoose.model(mapToChangedNames[EDictionariesNames.WarMachines], ChangedWarMachinesSchema);