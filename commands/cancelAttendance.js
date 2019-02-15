const att = require("../app.js");
const today = new Date();

module.exports = {
  name: "cancelattendance",
  description: "Cancels attendance tracking for the day.",
  execute(message) {
    if (
      message.member.roles.has(
        message.guild.roles.find(role => role.name === "Veterans").id
      ) ||
            message.member.roles.has(
              message.guild.roles.find(role => role.name === "Officer").id
            )
    ) { 
      if (today.getDay() === 5 || today.getDay() === 6) {
        att.cancelAttendance();
        message.channel.send(
          "Attendance tracking for today has been cancelled. Please remember if you want to cancel for another day, you must use this command again on that day."
        );
      } else {
        message.channel.send("It is not a raid day (Friday/Saturday).");
      }
    } else {
      message.channel.send(
        "Sorry you don't have permissions to do that."
      );
    }
  }
};
