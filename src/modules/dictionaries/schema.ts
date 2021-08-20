import * as mongoose from "mongoose";
import {EDictionariesNames} from "./constants";

/**
 * Локализованные названия
 */
const LocalizationSchema = new mongoose.Schema({
    en: {
        required: true,
        type: String,
    },
    ru: {
        required: true,
        type: String,
    },
});

/**
 * Схема одной записи справочника "Заклинания"
 */
const SpellsRecordSchema = new mongoose.Schema({
    game_id: {
        type: [String],
        required: true
    },
    localize_name: LocalizationSchema
});

export const SpellsModel = mongoose.model(EDictionariesNames.Spells, SpellsRecordSchema);

/**
 * Схема одной записи справочника "Школы"
 */
const SkillsRecordSchema = new mongoose.Schema({
    game_id: {
        type: [String],
        required: true
    },
    localize_name: LocalizationSchema
});

export const SkillsModel = mongoose.model(EDictionariesNames.Skills, SkillsRecordSchema);

/**
 * Схема одной записи справочника "Навыки"
 */
const PerksRecordSchema = new mongoose.Schema({
    game_id: {
        type: [String],
        required: true
    },
    localize_name: LocalizationSchema,
});

export const PerksModel = mongoose.model(EDictionariesNames.Perks, PerksRecordSchema);

/**
 * Схема одной записи справочника "Герои"
 */
const HeroesRecordSchema = new mongoose.Schema({
    game_id: {
        type: [String],
        required: true
    },
    localize_name: LocalizationSchema,
    race_game_id: {
        type: String,
        required: true
    }
});

export const HeroesModel = mongoose.model(EDictionariesNames.Heroes, HeroesRecordSchema);

/**
 * Параметры существ
 */
const CreatureParametersSchema = new mongoose.Schema({
    initiative: {
        type: [Number],
        required: true
    }
});

/**
 * Схема одной записи справочника "Артефакты"
 */
const ArtifactsRecordSchema = new mongoose.Schema({
    game_id: {
        type: [String],
        required: true
    },
    localize_name: LocalizationSchema,
    parameters: CreatureParametersSchema,
});

export const ArtifactsModel = mongoose.model(EDictionariesNames.Artifacts, ArtifactsRecordSchema);

/**
 * Схема одной записи справочника "Существа"
 */
const CreaturesRecordSchema = new mongoose.Schema({
    game_id: {
        type: [String],
        required: true
    },
    localize_name: LocalizationSchema,
});

export const CreaturesModel = mongoose.model(EDictionariesNames.Creatures, CreaturesRecordSchema);

/**
 * Схема одной записи справочника "Расы"
 */
const RacesRecordSchema = new mongoose.Schema({
    game_id: {
        type: [String],
        required: true
    },
    localize_name: LocalizationSchema,
});

export const RacesModel = mongoose.model(EDictionariesNames.Races, RacesRecordSchema);

/**
 * Схема одной записи справочника "Боевые машины"
 */
const WarMachinesRecordSchema = new mongoose.Schema({
    game_id: {
        type: [String],
        required: true
    },
    localize_name: LocalizationSchema,
});

export const WarMachinesModel = mongoose.model(EDictionariesNames.WarMachines, WarMachinesRecordSchema);
