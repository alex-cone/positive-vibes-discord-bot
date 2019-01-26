const bq = require('../bq.js');

module.exports = {
    name: 'attendance',
    description: 'Returns the total attendance percentage for a player',
    execute(message, args) {
        let name = '';
        if (args[0]) {
            name = args[0];
        } else {
            if (message.member.nickname) {
                name = message.member.nickname
            } else {
                name = message.member.user.username
            }
        }
        bq.getTotalAttendance(name).then(result => {
            if (name && result) {
                message.channel.send(name + " has a " + result + "% attendance rating.");
            } else {
                message.channel.send("I could not find attendance ratings for the specified person.")
            }
        });

    },
}