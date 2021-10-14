import * as mongoose from "mongoose";
import {EMapVersionValues} from "./map-version-model";

const MapVersionSchema = new mongoose.Schema({
    value: {
        enum: Object.values(EMapVersionValues),
        required: true,
        type: String,
    },
});

export const MapVersionModel = mongoose.model('map-versions', MapVersionSchema)