
/**
 * Названия таблиц словарей
 */
export enum EDictionariesNames {
    Artifacts = 'artifacts',
    Creatures = 'creatures',
    Heroes = 'heroes',
    Perks = 'perks',
    Races = 'races',
    Skills = 'skills',
    Spells = 'spells',
    WarMachines = 'war-machines',
    ChangedArtifacts = 'changed-artifacts',
    ChangedCreatures = 'changed-creatures',
    ChangedHeroes = 'changed-heroes',
    ChangedPerks = 'changed-perks',
    ChangedRaces = 'changed-races',
    ChangedSkills = 'changed-skills',
    ChangedSpells = 'changed-spells',
    ChangedWarMachines = 'changed-war-machines',
}

// для получения измененных ид всех объектов
export const aggregateSubjectText = (mapType: string, mapVersion: string) => [
    {$graphLookup:{
        from: "map-tests",
        startWith: "$map",
        connectFromField: "map",
        connectToField: "parent",
        as: "arr",
        },
    },
    {$match: {
        $or: [
            {
                arr: {
                    $elemMatch: {
                        $and: [
                            {
                                "map.type": mapType,
                                "map.version": mapVersion,
                            },
                        ],
                    },
                },
            },
            {
                $and: [
                    {
                        "map.type": mapType,
                        "map.version": mapVersion,
                    },
                ],
            },
        ],
    },
    },
    {$addFields: {
        arr_size: {$size: "$arr" }
        }
    },
    {$sort: {
        game_id: 1,
        arr_size: 1,
        },
    },
    {$group: {
        _id: {game_id: "$game_id"},
        change_id: {$first: "$change_id"},
        },
    }
]



