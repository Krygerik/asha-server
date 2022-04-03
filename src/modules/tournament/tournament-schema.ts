import {EPlayerColor} from "../game";
import { ERoundFormat, ITournament } from "./tournament-model";
import {Model, Schema, model} from "mongoose";

const PlayerSchema = new Schema({
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
}, { _id: false });

const GridSchema = new Schema({
    children_rounds: {
        type: [Number],
        required: true,
        default: [],
    },
    games: {
        default: [],
        required: true,
        type: [String],
    },
    number_of_round: {
        required: true,
        type: Number,
    },
    parent_round: Number,
    players: {
        type: [PlayerSchema],
        required: true,
    },
    round_format: {
        enum: Object.values(ERoundFormat),
        required: true,
        type: String,
    },
    winner_id: String,
}, { _id: false });

const TournamentSchema = new Schema({
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
    },
    maximum_player_count: {
        default: 4,
        required: true,
        type: Number,
    },
    rounds_format: {
        default: ERoundFormat.Bo3,
        enum: Object.values(ERoundFormat),
        required: true,
        type: String,
    },
    super_final_format: {
        default: ERoundFormat.Bo5,
        enum: Object.values(ERoundFormat),
        required: true,
        type: String,
    },
    winner_id: String,
}, { versionKey: false });

export const TournamentModel: Model<ITournament> = model('tournament', TournamentSchema);
