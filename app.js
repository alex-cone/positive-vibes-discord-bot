const Discord = require("discord.js")
const client = new Discord.Client();
const creds = require('./credentials.js')
const docs = require('./docs.js')
const prefix = "!"

client.on("ready", () => {
    console.log("Hello?")
    docs.authorize(creds["installed"].client_secret, creds["installed"].client_id, creds["installed"].redirect_uris, docs.listMacros)
    console.log("I am ready!");
});

client.on("message", (message) => {
    if (message.content === `${prefix}macro`) {
        if (message.member.roles.has(message.guild.roles.find(role => role.name === "Veterans").id) || message.member.roles.has(message.guild.roles.find(role => role.name === "Officer").id)) {
            docs.listMacros(null,sendMacros);
            function sendMacros(){
                console.log("sending message...")
                message.channel.send("```\n" + macro + "```");
            }
        } else {
            message.channel.send("Sorry you don't have permissions to do that.")
        }
    }
});

client.login(creds["botToken"])
