import * as mongoose from "mongoose";
import {EPlayerColor} from "./model";

const CreatureSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        required: true
    },
});

const PlayerSchema = new mongoose.Schema({
    army: {
        type: [CreatureSchema],
        required: true
    },
    army_remainder: [CreatureSchema],
    arts: {
        type: [String],
        required: true
    },
    attack: {
        type: Number,
        required: true
    },
    color: {
        type: Number,
        enum: Object.values(EPlayerColor),
        required: true
    },
    changed_rating: Number,
    defence: {
        type: Number,
        required: true
    },
    hero: {
        type: String,
        required: true
    },
    knowledge: {
        type: Number,
        required: true
    },
    level: {
        type: Number,
        required: true
    },
    luck: {
        type: Number,
        required: true
    },
    mana_start: {
        type: Number,
        required: true
    },
    mentoring: {
        type: Number,
        required: true
    },
    morale: {
        type: Number,
        required: true
    },
    perks: {
        type: [String],
        required: true
    },
    race: {
        type: String,
        required: true
    },
    skills: {
        type: [String],
        required: true
    },
    spell_power: {
        type: Number,
        required: true
    },
    spells: {
        type: [String],
        required: true
    },
    start_bonus: {
        type: String,
        required: true
    },
    new_rating: Number,
    user_id: String,
    war_machines: {
        type: [String],
        required: true
    },
    winner: {
        default: false,
        required: true,
        type: Boolean,
    }
});

const GameSchema = new mongoose.Schema({
    combat_id: {
        type: String,
        required: true
    },
    date: {
        type: String,
    },
    disconnect: {
        default: false,
        required: true,
        type: Boolean,
    },
    waiting_for_disconnect_status: {
        default: false,
        required: true,
        type: Boolean,
    },
    winner: {
        enum: Object.values(EPlayerColor),
        type: Number,
    },
    map_version: {
        type: String,
        required: true,
    },
    percentage_of_army_left: Number,
    players_ids: {
        type: [String],
        required: true
    },
    players: {
        type: [PlayerSchema],
        required: true
    },
    tournament_id: String,
    tournament_name: String,
    number_of_round: Number,
});

export const GameModel = mongoose.model('game', GameSchema);
