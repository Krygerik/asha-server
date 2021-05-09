import * as mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    hash_password: {
        type: String,
        required: true,
    }
});

export const UserModel = mongoose.model('users', UserSchema);
