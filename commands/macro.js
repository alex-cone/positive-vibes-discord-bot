const docs = require('../docs.js')

module.exports = {
    name: 'macro',
    description: 'Prints out a G\'huun macro list from a specific Google Sheet that is already formatted',
    execute(message, args) {
        if (message.member.roles.has(message.guild.roles.find(role => role.name === "Veterans").id) || message.member.roles.has(message.guild.roles.find(role => role.name === "Officer").id)) {
            docs.listMacros(null, sendMacros);
            function sendMacros() {
                console.log("sending message...");
                message.channel.send("```\n" + macro + "```");
            }
        } else {
            message.channel.send("Sorry you don't have permissions to do that.");
        }

    },
}