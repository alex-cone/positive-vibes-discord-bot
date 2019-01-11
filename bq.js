// Imports the Google Cloud client library
const { BigQuery } = require('@google-cloud/bigquery');

// Creates a client
const bigquery = new BigQuery({
    projectId: 'GhuunMacroDiscord',
    keyFileName: 'C:/Users/Alex/Documents/GhuunMacroDiscord-2d3114f0af63.json',
});

const query = `SELECT name
  FROM \`bigquery-public-data.usa_names.usa_1910_2013\`
  WHERE state = 'TX'
  LIMIT 100`;
const options = {
    query: query,
    // Location must match that of the dataset(s) referenced in the query.
    location: 'US',
};
blah();
async function blah() {
    // The SQL query to run
    const sqlQuery = `SELECT
        CONCAT(
        'https://stackoverflow.com/questions/',
        CAST(id as STRING)) as url,
        view_count
        FROM \`bigquery-public-data.stackoverflow.posts_questions\`
        WHERE tags like '%google-bigquery%'
        ORDER BY view_count DESC
        LIMIT 10`;

    const options = {
        query: sqlQuery,
        // Location must match that of the dataset(s) referenced in the query.
        location: 'US',
    };

    // Runs the query
    const [rows] = await bigquery.query(options);
}
