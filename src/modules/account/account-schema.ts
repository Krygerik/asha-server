import * as mongoose from "mongoose";
import { uuid } from 'uuidv4';

const AccountSchema = new mongoose.Schema({
    banned: {
        default: false,
        required: true,
        type: Boolean,
    },
    clientConnectId: {
        default: uuid(),
        required: true,
        type: String,
    },
    create_date: {
        default: new Date(),
        required: true,
        type: Date,
    },
    discordId: {
        type: String,
        required: true,
    },
    discriminator: {
        type: String,
        required: true,
    },
    merged_with_old_account: {
        default: false,
        required: true,
        type: Boolean,
    },
    nickname: String,
    original_rating: Number,
    rating: {
        default: 1200,
        required: true,
        type: String,
    },
    roles: {
        default: [],
        required: true,
        type: [String],
    },
    tournaments: {
        default: [],
        required: true,
        type: [String],
    },
    username: {
        type: String,
        required: true,
    },
})

export const AccountModel = mongoose.model('accounts', AccountSchema);