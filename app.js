const Discord = require("discord.js");
const client = new Discord.Client();
const creds = require('./credentials.js');
const docs = require('./docs.js');
const fs = require('fs');
const schedule = require('node-schedule')
const bnet = require('./bnet.js')
const prefix = "!";
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const raidCron = '30 19-22 * * 5,6' //raid times, checks every 30 minutes (I think)
const testCron = '* * * * *' //every minute
client.commands = new Discord.Collection();

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    client.commands.set(command.name, command);
}

client.on("ready", () => {
    console.log("Hello :)")
    //authorization for google sheets access
    docs.authorize(creds["installed"].client_secret, creds["installed"].client_id, creds["installed"].redirect_uris, docs.listMacros)
    schedule.scheduleJob(testCron, function () {
        console.log("Current Attendance: ")
        let chickenDinner = client.guilds.get('227260885746450433');
        if (chickenDinner && chickenDinner.available) {
            let voiceMembers = chickenDinner.channels.find(VoiceChannel => VoiceChannel.name.startsWith("Raiding")).members.array();
            if (voiceMembers.length > 0) {
                console.log(voiceMembers[0].nickname)
            }
        }
    });
    console.log("I am ready!");
});

client.on("message", (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    if (!client.commands.has(command)) return;
    try {
        client.commands.get(command).execute(message, args);
    }
    catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

client.login(creds["botToken"])
