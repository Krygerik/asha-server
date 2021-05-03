import * as mongoose from "mongoose";

/**
 * Схема одной записи справочника "Расы"
 */
const RaceRecordSchema = new mongoose.Schema({
    game_id: {
        type: String,
        required: true
    },
    localize_name: {
        type: String,
        required: true
    },
});

/**
 * Схема всех справочников
 */
const DictionariesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    records: {
        type: [RaceRecordSchema],
        required: true
    },
});

export const DictionariesModel = mongoose.model('dictionaries', DictionariesSchema);
