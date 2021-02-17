import * as mongoose from "mongoose";

const GameSchema = new mongoose.Schema({
    combat_id: Number,
});

export const GameModel = mongoose.model('game', GameSchema);
