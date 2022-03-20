import {EPlayerColor, ISavedGame} from "./model";
import {Model, model, Schema} from "mongoose";

const CreatureSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        count: {
            type: Number,
            required: true
        },
    },
    {
        _id: false
    }
);

const PlayerSchema = new Schema(
    {
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
    },
    {
        _id: false
    }
);

const GameSchema = new Schema({
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
        required: true,
        type: String,
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
    ladder_id: String,
    number_of_round: Number,
    tournament_id: String,
    tournament_name: String,
}, { versionKey: false });

export const GameModel: Model<ISavedGame> = model('games', GameSchema);
