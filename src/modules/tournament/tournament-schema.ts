import * as mongoose from "mongoose";

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
});

export const TournamentModel = mongoose.model('tournament', TournamentSchema);
