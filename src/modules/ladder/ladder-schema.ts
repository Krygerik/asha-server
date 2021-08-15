import * as mongoose from "mongoose";

const LadderSchema = new mongoose.Schema({
    member_ids: {
        default: [],
        required: true,
        type: [String],
    },
    active: {
        default: true,
        required: true,
        type: Boolean,
    },
    game_ids: {
        default: [],
        required: true,
        type: [String],
    }
});

export const LadderModel = mongoose.model('ladder', LadderSchema);
