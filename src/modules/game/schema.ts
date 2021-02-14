import * as mongoose from "mongoose";
import {ModificationNote} from "../common/model";

const GameSchema = new mongoose.Schema({
    combat_id: Number,
    modification_notes: [ModificationNote]
});

export const GameModel = mongoose.model('game', GameSchema);
