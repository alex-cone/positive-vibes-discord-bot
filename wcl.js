const wcl = require('weasel.js');
const creds = require('./credentials.js');

wcl.setApiKey(creds.wclSecret);
getGuildAttendance();
function getAParse(args, params, callback) {
    if (!args.regionName) {
        args.regionName = 'us'
    }
    args.realmName.replace("'", "");
    wcl.getZones(function (err, data) {
        if (err) {
            console.log(err);
            return;
        }
        data.forEach(zone => {
            if (zone.name === args.raidName) {
                params.zone = zone.id;
            }
        })
        params.timeframe = 'historical';
        wcl.getRankingsCharacter(args.characterName, args.realmName, args.regionName, params, function (err, data) {
            if (err) {
                console.log(err);
                return;
            }
            if ((!data || data.length === 0) && !params.partition) {
                console.log("Could not find any parses for the latest patch. Trying an earlier one...")
                params.partition = 1;
                getAParse(args, params, callback);
            } else {
                console.log("Found parse data...")
                const percentile = data.find(enc => enc.encounterName === args.bossName).percentile;
                const rank = data.find(enc => enc.encounterName === args.bossName).rank;
                if (params.partition) {
                    callback("You are at the " + percentile + "th percentile of players of your spec for this fight on your best attempt." + " Your rank for this fight is " + rank + ". Note that this is a parse from an earlier patch");
                } else {
                    callback("You are at the " + percentile + "th percentile of players of your spec for this fight on your best attempt." + " Your rank for this fight is " + rank + ".");
                }
            }
        });
    });
}

function getAllBestParses(args, params, callback) {
    if (!args.regionName) {
        args.regionName = 'us'
    }
    args.realmName.replace("'", "");
    wcl.getZones(function (err, data) {
        if (err) {
            console.log(err);
            return;
        }
        data.forEach(zone => {
            if (zone.name === args.raidName) {
                params.zone = zone.id;
            }
        })
        params.timeframe = 'historical';
        wcl.getRankingsCharacter(args.characterName, args.realmName, args.regionName, params, function (err, data) {
            if (err) {
                console.log(err);
                return;
            }
            if ((!data || data.length === 0) && !params.partition) {
                console.log("Could not find any parses for the latest patch. Trying an earlier one...")
                params.partition = 1;
                getAllBestParses(args, params, callback);
            } else {
                console.log("Found parse data...")
                let result = "";
                let encounters = new Map();
                data.forEach(enc => {
                    if (!encounters.get(enc.encounterName)) {
                        encounters.set(enc.encounterName, { percentile: enc.percentile, rank: enc.rank, difficulty: enc.difficulty, reportID: enc.reportID });
                    }
                });
                console.log(encounters)
                encounters.forEach(function (enc, key) {
                    console.log(enc)
                    if (enc.difficulty === 3) {
                        result = result + "Normal " + key + "\n";
                    } else if (enc.difficulty === 4) {
                        result = result + "Heroic " + key + "\n";
                    } else if (enc.difficulty === 5) {
                        result = result + "Mythic " + key + "\n";
                    }
                    result = result + "Percentile: " + enc.percentile + "\n";
                    result = result + "Rank: " + enc.rank + "\n\n";
                });
                if (params.partition) {
                    callback("No current patch data found... Using older patch data for damage parse: \n\n" + result);
                } else {
                    callback("Damage Parses: \n\n" + result);
                }
            }
        });
    });
}

function getGuildAttendance() {
    wcl.getReportsGuild('Chicken Dinner', 'Kiljaeden', 'us', {}, function (err, data) {
        if (err) {
            console.log(err);
            return;
        }
        wcl.getReportFights(data[0].id, {}, function (err, data) {
            if (err) {
                console.log(err);
                return;
            }
            data.friendlies.map(rep => console.log(rep.name));
        });
    });
}

module.exports.getAParse = getAParse;
module.exports.getAllBestParses = getAllBestParses;
