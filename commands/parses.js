const wcl = require("../wcl.js");

module.exports = {
  name: "parses",
  description:
        "Retrieves percentile and ranking parses for the specified character, realm, and raid",
  execute(message, args) {
    let mapArgs;
    if (!args || args.length < 3) {
      message.channel.send(
        "You do not provide enough arguments for this command. The format should be !parse <characterName> <realmName> <raidName> <bossName>"
      );
      return;
    } else if (args.length === 3) {
      mapArgs = {
        characterName: args[0],
        realmName: args[1],
        raidName: args[2]
      };
    } else if (args.length === 4) { 
      mapArgs = {
        characterName: args[0],
        realmName: args[1],
        raidName: args[2],
        regionName: args[4]
      };
    }
    wcl.getAllBestParses(mapArgs, {}, function post(result) {
      message.channel.send(result);
    });
  }
};
