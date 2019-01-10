const wcl = require('../wcl.js')

module.exports = {
    name: 'parse',
    description: 'Retrieves a percentile and ranking parse for the specified character, realm, raid, and encounter',
    execute(message, args) {
        let mapArgs;
        if(!args || args.length < 4){
            message.channel.send("You do not provide enough arguments for this command. The format should be !parse <characterName> <realmName> <raidName> <bossName>")
            return;
        } else if (args.length === 4) {
            mapArgs = {characterName: args[0], realmName: args[1], raidName: args[2], bossName: args[3]}
        } else if (args.length === 5) {
            mapArgs = {characterName: args[0], realmName: args[1], raidName: args[2], bossName: args[3], regionName: args[4]}
        }
        wcl.getAParse(mapArgs, {}, function post(result){
            message.channel.send(result);
        })
    },
}