import * as mongoose from "mongoose";

const MapVersionSchema = new mongoose.Schema({
    value: {
        required: true,
        type: String,
    },
});

export const MapVersionModel = mongoose.model('map-versions', MapVersionSchema)