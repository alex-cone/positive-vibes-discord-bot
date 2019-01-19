const Discord = require("discord.js");
const client = new Discord.Client();
const creds = require('./credentials.js');
const bq = require('./bq.js');
const docs = require('./docs.js');
const fs = require('fs');
const cron = require('cron');
const bnet = require('./bnet.js')
const prefix = "!";
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const raidCron = '*/2 19-22 * * 5,6' //raid times, checks every 2 minutes (I think)
const testCron = '* * * * *' //every minute
let attendanceMap = {};
let cancel = false;
let = '';
client.commands = new Discord.Collection();

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    client.commands.set(command.name, command);
}

client.on("ready", () => {
    console.log("Hello :)")
    process.env.TZ = 'America/LosAngeles'
    //authorization for google sheets access
    docs.authorize(creds["installed"].client_secret, creds["installed"].client_id, creds["installed"].redirect_uris, docs.listMacros)
    const job = new cron.CronJob({
        cronTime: raidCron,
        onTick: discordAttendance,
        start: true,
        timeZone: 'America/Los_Angeles',
        onComplete: postData,
    })
    console.log("I am ready!");
});

client.on("message", (message) => {
    // Troll Harry statement
    // if (message.author.id === message.guild.members.find(member => member.nickname === 'Moonfire bot (Harry btw)').id){
    //     message.react(message.guild.emojis.find(emoji => emoji.name == 'HYPERS').id);
    // }
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).match(/(?:[^\s"]+|"[^"]*")+/g).map(arg =>  arg = arg.replace(new RegExp("\"", "g"), ""));
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

const discordAttendance = () => {
    console.log("Current Attendance: ");
    let chickenDinner = client.guilds.get('227260885746450433');
    if (chickenDinner && chickenDinner.available) {
        let voiceMembers = chickenDinner.channels.find(VoiceChannel => VoiceChannel.name.startsWith("Raiding")).members.array();
        if (voiceMembers.length > 0) {
            const today = new Date();
            key = months[today.getMonth()] + today.getDate();
            voiceMembers.map(member => {
                if (member.nickname) {
                    attendanceMap[Number(member.id)] = {
                        name: member.nickname,
                    }
                } else {
                    attendanceMap[Number(member.id)] = {
                        name: member.username,
                    }
                }
                if (isNaN(attendanceMap[Number(member.id)][key])) {
                    attendanceMap[Number(member.id)][key] = 0;
                }
                attendanceMap[Number(member.id)][key] = attendanceMap[Number(member.id)][key] + 1;
            });
        }
    }
}

const postData = () => {
    attendanceArray = Object.entries(attendanceMap);
    if (attendanceArray.length >= 20 && cancel === false) {
	console.log("Posting attendance");
        for (let i = 0; i < attendanceArray.length; i++) {
            if (attendanceArray[i][1][key] >= 90) {
                attendanceMap[attendanceArray[i][0]][key] = 1;
            } else if (attendanceArray[i][1][key] < 90 && attendanceArray[i][1][key] > 30) {
                attendanceMap[attendanceArray[i][0]][key] = .5;
            } else {
                attendanceMap[attendanceArray[i][0]][key] = 0;
            }
        }
        bq.generateCurrentAttendanceJSON(attendanceMap);
    }
    cancel = false;
    attendanceMap = {}
    key = '';
}

const months = {
    0: 'Jan',
    1: 'Feb',
    2: 'Mar',
    3: 'Apr',
    4: 'May',
    5: 'Jun',
    6: 'Jul',
    7: 'Aug',
    8: 'Sep',
    9: 'Oct',
    10: 'Nov',
    11: 'Dec'
}

const cancelAttendance = () => {
    cancel = true;
}

module.exports.cancelAttendance = cancelAttendance;
