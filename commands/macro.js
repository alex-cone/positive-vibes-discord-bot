const docs = require("../docs.js");

module.exports = {
  name: "macro",
  description:
        "Prints out a G'huun macro list from a specific Google Sheet that is already formatted",
  execute(message) {
    if (
      message.member.roles.has(
        message.guild.roles.find(role => role.name === "Veterans").id
      ) ||
            message.member.roles.has(
              message.guild.roles.find(role => role.name === "Officer").id
            )
    ) {
      docs.listMacros(null, (macro) => {
        console.log("sending message...");
        message.react(
          message.guild.emojis.find(emoji => emoji.name == "HYPERS")
            .id
        );
        message.channel.send("```\n" + macro + "```");
      });
    } else {
      message.channel.send(
        "Sorry you don't have permissions to do that."
      );
    }
  }
};
