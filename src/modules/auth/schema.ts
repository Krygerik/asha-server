import * as mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
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
