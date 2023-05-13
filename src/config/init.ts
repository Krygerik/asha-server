
import {DictionariesService} from "../modules/dictionaries";
import {EDictionariesNames, needToChangeDict} from "../modules/dictionaries/constants";

const artifactsJSON = require("../static_db_values/original-dictionaries/artifacts.json");
const creaturesJSON = require("../static_db_values/original-dictionaries/creatures.json");
const heroesJSON = require("../static_db_values/original-dictionaries/heroes.json");
const perksJSON = require("../static_db_values/original-dictionaries/perks.json");
const racesJSON = require("../static_db_values/original-dictionaries/races.json");
const skillsJSON = require("../static_db_values/original-dictionaries/skills.json");
const spellsJSON = require("../static_db_values/original-dictionaries/spells.json");
const warMachinesJSON = require("../static_db_values/original-dictionaries/war-machines.json");

const mapDictionaryNameToFileJSON = {
        [EDictionariesNames.Artifacts]: artifactsJSON,
        [EDictionariesNames.Creatures]: creaturesJSON,
        [EDictionariesNames.Heroes]: heroesJSON,
        [EDictionariesNames.Perks]: perksJSON,
        [EDictionariesNames.Races]: racesJSON,
        [EDictionariesNames.Skills]: skillsJSON,
        [EDictionariesNames.Spells]: spellsJSON,
        [EDictionariesNames.WarMachines]: warMachinesJSON,
    }

export async function initMongo(): Promise<any> {
	let dictionariesService: DictionariesService = new DictionariesService();
	if (needToChangeDict) {
		for (let key in DictionariesService.mapDictionaryNameToModel) {
			let model = DictionariesService.mapDictionaryNameToModel[key];
			
			let result = await model.deleteMany()
			.then((res) => {
				console.log("SUCCESS<deleteMany>");
				return model.insertMany(mapDictionaryNameToFileJSON[key]).then(res => {
					console.log("SUCCESS<insertMany>");
					return res;
				}, (err) => {
					console.log("ERROR<insertMany>: " + err);
				});
			}, (err) => {
    	        console.log("ERROR<deleteMany>: " + err);
    	    });
			return result;		
		}
	}
}