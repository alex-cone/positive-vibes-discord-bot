const { BigQuery } = require("@google-cloud/bigquery");
const fs = require("fs");
const { Storage } = require("@google-cloud/storage");
const converter = require("json-2-csv");
const projectId = "ghuunmacrodiscord";
const datasetId = "guild_attendance";
const tableId = "discord_attendance";
const bucketName = "discord-bot-bucket";
const bigquery = new BigQuery({
  projectId,
  keyFilename: "GhuunMacroDiscord-2d3114f0af63.json"
});
const storage = new Storage({
  projectId,
  keyFilename: "GhuunMacroDiscord-2d3114f0af63.json"
});

// https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs#configuration.load
const metadata = {
  sourceFormat: "CSV",
  autodetect: true,
  writeDisposition: "WRITE_TRUNCATE"
};

const nonDayKeys = ["name", "totalPercent", "id", "totalDays"];
function generateCurrentAttendanceJSON(newData) {
  bigquery
    .dataset(datasetId)
    .table(tableId)
    .getRows()
    .then(rows => {
      if (!newData) {
        console.error("There is no new data to be posted.");
        return;
      }
      // if there is no current data, change the newData to the proper format for BigQuery load, otherwise add the newData to the existing data
      if (!rows) {
        rows = newData;
      } else {
        let idList = [];
        rows[0].forEach(row => {
          idList.push(row.id.toString());
          if (Object.keys(newData).includes(row.id.toString())) {
            const newValues = Object.entries(newData[row.id.toString()]);
            for (let i = 0; i < newValues.length; i++) {
              if (newValues[i][0] != "name") {
                row[newValues[i][0]] = Number(newValues[i][1]);
              }
            }
          }
        });
        // add new users who do not already exist in the data
        const arrData = Object.entries(newData);
        for (let i = 0; i < arrData.length; i++) {
          if (!idList.includes(arrData[i][0])) {
            const day = Object.keys(arrData[i][1])[1];
            const newEntry = {
              name: arrData[i][1].name,
              id: arrData[i][0],
              totalDays: 0,
              totalPercent: 0
            };
            newEntry[day] = Number(arrData[i][1][day]);
            rows[0].push(newEntry);
          }
        }
      }
      const attendanceJSON = rows[0].values();
      let playerCount = 0;
      let attendance = attendanceJSON.next();
      while (!attendance.done) {
        playerCount++;
        attendance = attendanceJSON.next();
      }
      for (let i = 0; i < playerCount; i++) {
        let total = 0;
        for (const value in rows[0][i]) {
          if (value === "totalDays") {
            rows[0][i][value] = rows[0][i][value] + 1;
          }
          if (!nonDayKeys.contains(value)) {
            if (isNaN(rows[0][i][value]) || !rows[0][i][value]) {
              rows[0][i][value] = 0;
            }
            rows[0][i][value] = Number(rows[0][i][value]);
            total += rows[0][i][value];
          }
        }
        rows[0][i].totalPercent = 100 * (total / rows[0][i].totalDays);
      }
      processAttendance(rows[0]);
    });
}

function processAttendance(rows) {
  const options = {
    emptyFieldValue: 0
  };
  converter
    .json2csvAsync(rows, options)
    .then(csv => {
      const date = new Date();
      const jsonDate = date.toISOString().substring(0, 10);
      // generates a fileName based on date, random number
      const fileName = `attendance${jsonDate}-${Math.floor(
        Math.random() * Math.floor(10000)
      )}.csv`;
      console.log(fileName);
      fs.writeFile(fileName, csv, "utf8", err => {
        if (err) {
          console.log(
            `Some error occured - file either not saved or corrupted file saved.${err}`
          );
        } else {
          console.log("It's saved!");
          storage
            .bucket(bucketName)
            .upload(fileName, {
              metadata
            })
            .then(
              bigquery
                .dataset(datasetId)
                .table(tableId)
                .load(fileName, metadata)
                .then(data => {
                  if (!data[0].status.errors) {
                    console.log("Successfully updated attendance table.");
                  } else {
                    console.error(data[0].status.errors);
                  }
                })
                .catch(err => console.error(err))
            );
        }
      });
    })
    .catch(err => console.error(err));
}

async function getTotalAttendance(name) {
  const query = `SELECT totalPercent FROM \`ghuunmacrodiscord.guild_attendance.discord_attendance\` WHERE name='${name}'`;
  const options = {
    query,
    location: "US"
  };

  const [job] = await bigquery.createQueryJob(options);
  console.log(`Job ${job.id} started.`);
  const [rows] = await job.getQueryResults();
  let result = "";
  rows.forEach(row => (result = row.totalPercent));
  return result;
}

async function getLatestAttendance() {
  let fileName = "";
  await storage
    .bucket(bucketName)
    .getFiles()
    .then(files => {
      let compareDate = new Date("1970-01-15T06:58:00.794Z");
      files[0].forEach(file => {
        let tempDate = new Date(file.metadata.timeCreated);
        if (tempDate > compareDate) {
          compareDate = tempDate;
          fileName = file.id;
        }
      });
    });
  console.log(fileName);
  await storage
    .bucket(bucketName)
    .file(fileName)
    .download({ destination: "./latest.csv" });
  return fileName;
}

module.exports.generateCurrentAttendanceJSON = generateCurrentAttendanceJSON;
module.exports.getTotalAttendance = getTotalAttendance;
module.exports.getLatestAttendance = getLatestAttendance;
