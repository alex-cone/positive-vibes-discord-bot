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
    Jan17: '1'
  },
  126: {
    name: 'Jupix',
    Jan17: '1'
  },
  130: {
    name: 'Dwang',
    Jan17: '0'
  }
};

generateCurrentAttendanceJSON(newData);
function generateCurrentAttendanceJSON(newData) {
  bigquery
    .dataset(datasetId)
    .table(tableId)
    .getRows().then(rows => {
      if (!rows[0][1]) {
        console.log("No table exists, using default data...")
        rows = [
          [
            {
              name: "Toyola",
              id: "124",
              totalPercent: ".66",
              Jan13: "1",
              Jan14: "1",
              Jan15: "1",
              Jan16: "0",
            },
            {
              name: "Jupix",
              id: "126",
              totalPercent: ".33",
              Jan13: "1",
              Jan14: "0",
              Jan15: "1",
              Jan16: "0",
            },
            {
              name: "Dwang",
              id: "130",
              totalPercent: ".66",
              Jan13: "1",
              Jan14: "0",
              Jan15: "1",
              Jan16: "1",
            }
          ]
        ]
      }
      if (!newData) {
        console.error("There is no new data to be posted.");
        return;
      }
      rows[0].forEach(row => {
        if (Object.keys(newData).includes(row.id.toString())) {
          console.log(newData[row.id.toString()])
          let newValues = newData[row.id.toString()] //this is where I left off, trying to add newData to the current retrieved data in BQ
          let newEntries = newValues.next();
          while (!newEntries.done) {
            for (let value in newEntries.value) {
              if (value != 'name') {
                row[value] = newData['' + row.id][value];
              }
            }
            newEntries = newValues.next();
          }
        }
      })



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

