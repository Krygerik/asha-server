import { uuid } from 'uuidv4';
import { model, Model, Schema } from "mongoose";
import { IAccount } from "./account-types";

const AccountSchema = new Schema({
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

export const AccountModel: Model<IAccount> = model('accounts', AccountSchema);