const bq = require("../bq.js");

module.exports = {
  name: "export",
  description: "Posts the latest csv file of attendance.",
  execute(message) {
    bq.getLatestAttendance().then(
      message.channel.send(
        "Here is a csv with the latest attendance records :)",
        {
          file: "./latest.csv"
        }
      )
    );
  } 
};
