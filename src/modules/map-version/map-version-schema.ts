import * as mongoose from "mongoose";

export const MapVersionValueSchema = new mongoose.Schema({
    type: {
        required: true,
        type: String,
    },
    version: {
        required: true,
        type: String,
    }
}, { versionKey: false });

const MapVersionSchema = new mongoose.Schema({
    value: MapVersionValueSchema,
    parent: MapVersionValueSchema
}, { versionKey: false })

export const MapVersionModel = mongoose.model('map-versions', MapVersionSchema)