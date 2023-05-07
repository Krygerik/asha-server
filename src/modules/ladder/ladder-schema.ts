import {Model, model, Schema} from "mongoose";
import { ILadderRecord } from "./ladder-type";

const LadderSchema = new Schema({
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

export const LadderModel: Model<ILadderRecord> = model('ladder', LadderSchema);
