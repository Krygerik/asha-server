import * as mongoose from "mongoose";

const MappingNicknameToGameSchema = new mongoose.Schema({
    combat_id: Number,
    nickname: String,
});

export const MappingNicknameToGameModel = mongoose.model('mapping_nickname_to_game', MappingNicknameToGameSchema);
