import * as mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    account_merging_status: {
        default: false,
        required: true,
        type: Boolean,
    },
    discord: {
        required: true,
        type: String,
    },
    email: {
        required: true,
        type: String,
    },
    hash_password: {
        required: true,
        type: String,
    },
    nickname: {
        required: true,
        type: String,
    },
    original_rating: {
        default: 0,
        required: true,
        type: Number,
    },
    rating: {
        default: 1200,
        required: true,
        type: Number,
    },
    roles: {
        default: [],
        required: true,
        type: [String],
    },
    tournaments: {
        default: [],
        type: [String],
    },
});

export const UserModel = mongoose.model('users', UserSchema);
