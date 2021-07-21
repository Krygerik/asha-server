import * as mongoose from "mongoose";
import { ELogLevel } from "./client-logs-enums";

const ClientLogsSchema = new mongoose.Schema({
    date: String,
    data: String,
    level: {
        enum: Object.values(ELogLevel),
        type: String,
    },
    message: String,
    user_id: String,
});

export const ClientLogsModel = mongoose.model('client-logs', ClientLogsSchema);
