import {ModificationNote} from "../common/model";

export interface IGame {
    _id?: String;
    combat_id: String;
    modification_notes: ModificationNote[];
}