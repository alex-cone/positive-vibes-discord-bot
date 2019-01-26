// Imports the Google Cloud client library
const { BigQuery } = require('@google-cloud/bigquery');
const fs = require('fs');
const { Storage } = require('@google-cloud/storage')
const converter = require('json-2-csv');
const projectId = "ghuunmacrodiscord";
const datasetId = "guild_attendance";
const tableId = "discord_attendance";
const bucketName = "discord-bot-bucket";
const sampleJSON = {
  rows: [
    {
      name: "Toyola",
      totalPercent: ".66",
      Jan13: "1",
      Jan14: "1",
      Jan15: "1",
      Jan16: "0",
    },
    {
      name: "Jupix",
      totalPercent: ".33",
      Jan13: "1",
      Jan14: "0",
      Jan15: "1",
      Jan16: "0",
    },
    {
      name: "Dwang",
      totalPercent: ".66",
      Jan13: "1",
      Jan14: "0",
      Jan15: "1",
      Jan16: "1",
    }
  ]
}
// TODO: CLEAN UP EVERYTHING
// Creates a client
const bigquery = new BigQuery({
  projectId: projectId,
  keyFilename: 'GhuunMacroDiscord-2d3114f0af63.json'

});
const storage = new Storage({
  projectId: projectId,
  keyFilename: 'GhuunMacroDiscord-2d3114f0af63.json'
});

// Configure the load job. For full list of options, see:
// https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs#configuration.load
const metadata = {
  sourceFormat: 'CSV',
  autodetect: true,
  writeDisposition: 'WRITE_TRUNCATE'
};

const newData = {
  124: {
    name: 'Toyola',
    Jan20: '1'
  },
  126: {
    name: 'Jupix',
    Jan20: '1'
  },
  130: {
    name: 'Dwang',
    Jan20: '1'
  },
  140: {
    name: 'Shinypants',
    Jan20: '1'
  },
  160: {
    name: 'Swang',
    Jan20: '1'
  },
  170: {
    name: 'Kaledin',
    Jan20: '1'
  },
  172: {
    name: 'Bob',
    Jan20: '1'
  }
};

function generateCurrentAttendanceJSON(newData) {
  bigquery
    .dataset(datasetId)
    .table(tableId)
    .getRows().then(rows => {
      if (!newData) {
        console.error("There is no new data to be posted.");
        return;
      }
      // if there is no current data, change the newData to the proper format for BigQuery load, otherwise add the newData to the existing data
      if (!rows) {
        rows = newData;
      } else {
        idList = [];
        rows[0].forEach(row => {
          idList.push(row.id.toString());
          if (Object.keys(newData).includes(row.id.toString())) {
            let newValues = Object.entries(newData[row.id.toString()])
            for (let i = 0; i < newValues.length; i++) {
              if (newValues[i][0] != 'name') {
                row[newValues[i][0]] = Number(newValues[i][1]);
              }
            }
          } 
        })
        // add new users who do not already exist in the data
        let arrData = Object.entries(newData)
        for(let i = 0; i < arrData.length; i++) {
          if (!idList.includes(arrData[i][0])) {
            const day = Object.keys(arrData[i][1])[1];
            let newEntry = {
              name: arrData[i][1].name,
              id: arrData[i][0],
              totalPercent: 0,
            }
            newEntry[day] = Number(arrData[i][1][day]);
            rows[0].push(newEntry)
          }
        }
      }
      let attendanceJSON = rows[0].values();
      let count = 0;
      let playerCount = 0;
      let attendance = attendanceJSON.next();
      while (!attendance.done) {
        let tempCount = 0;
        for (let value in attendance.value) {
          if (value != 'name' && value != 'totalPercent' && value != 'id') {
            tempCount++;
          }
        }
        if (tempCount > count) {
          count = tempCount;
        }
        playerCount++;
        attendance = attendanceJSON.next();
      }
      for (let i = 0; i < playerCount; i++) {
        let total = 0;
        for (let value in rows[0][i]) {
          if (value != 'name' && value != 'totalPercent' && value != 'id') {
            if(isNaN(rows[0][i][value]) || !rows[0][i][value]) {
              rows[0][i][value] = 0;
            }
            rows[0][i][value] = Number(rows[0][i][value])
            total = total + rows[0][i][value];
          }
        }
        rows[0][i].totalPercent = 100 * (total / count);
      }
      processAttendance(rows[0]);
    })
}

function processAttendance(rows) {
  converter.json2csvAsync(rows).then(csv => {
    const date = new Date();
    const jsonDate = date.toISOString().substring(0, 10);
    //generates a fileName based on date, random number
    const fileName = 'attendance' + jsonDate + '-' + Math.floor(Math.random() * Math.floor(10000)) + '.csv';
    console.log(fileName)
    fs.writeFile(fileName, csv, 'utf8', function (err) {
      if (err) {
        console.log('Some error occured - file either not saved or corrupted file saved.' + err);
      } else {
        console.log('It\'s saved!');
        storage.bucket(bucketName).upload(fileName, {
          metadata
        }).then(bigquery
          .dataset(datasetId)
          .table(tableId)
          .load(fileName, metadata).then(data => {
            if (!data[0].status.errors) {
              console.log("Successfully updated attendance table.");
            } else {
              console.error(data[0].status.errors);
            }
          }
          ).catch(err => console.error(err)))
      }
    })
  }).catch(err => console.error(err));
}

async function getTotalAttendance(name) {
  const query = `SELECT totalPercent FROM \`ghuunmacrodiscord.guild_attendance.discord_attendance\` WHERE name='${name}'`;
  const options = {
    query: query,
    location: 'US',
  };

  const [job] = await bigquery.createQueryJob(options);
  console.log(`Job ${job.id} started.`);
  const [rows] = await job.getQueryResults();
  let result = '';
  rows.forEach(row => result = row.totalPercent);
  return result;
}

module.exports.generateCurrentAttendanceJSON = generateCurrentAttendanceJSON;
module.exports.getTotalAttendance = getTotalAttendance;
