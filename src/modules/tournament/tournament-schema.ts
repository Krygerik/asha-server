import * as mongoose from "mongoose";
import {EPlayerColor} from "../game";

const PlayerSchema = new mongoose.Schema({
    user_id: String,
    color: {
        enum: Object.values(EPlayerColor),
        type: Number,
    },
    win_count: {
        type: Number,
        default: 0,
        required: true,
    },
});

const GridSchema = new mongoose.Schema({
    children_rounds: {
        type: [Number],
        required: true,
        default: [],
    },
    parent_round: Number,
    number_of_round: {
        required: true,
        type: Number,
    },
    players: [PlayerSchema],
    winner_id: String,
});

const TournamentSchema = new mongoose.Schema({
    users: {
        default: [],
        required: true,
        type: [String],
    },
    name: {
        required: true,
        type: String,
    },
    start_date: {
        required: true,
        type: String,
    },
    started: {
        default: false,
        required: true,
        type: Boolean,
    },
    grid: {
        default: [],
        required: true,
        type: [GridSchema],
    }
});

export const TournamentModel = mongoose.model('tournament', TournamentSchema);
