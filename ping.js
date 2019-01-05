const Discord = require("discord.js")
const secrets = require("./secrets.js")
const client = new Discord.Client();

client.on("ready", () => {
    console.log("I am ready!");
});

client.on("message", (message) => {
    if(message.content.startsWith("ping")) {
        message.channel.send("pong!");
    }
});

client.login(secrets["botToken"])