const bq = require('../bq.js')
const today = new Date();

module.exports = {
    name: 'export',
    description: 'Posts the latest csv file of attendance.',
    execute(message, args) {
        bq.getLatestAttendance().then(result => {
                message.channel.send("Here is a csv with the latest attendance records :)", {
                    file: "./latest.csv"
                })
            }
        );
    },
}
