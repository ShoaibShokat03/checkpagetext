// Scheduled check — runs automatically on the cron below (no visitor needed).
const { schedule } = require('@netlify/functions');
const { runCheck } = require('./lib/checker');

// Runs every hour. Adjust the cron string as needed (https://crontab.guru).
exports.handler = schedule('@hourly', async () => {
    const result = await runCheck();
    console.log('Scheduled check result:', JSON.stringify(result.body));
    return { statusCode: result.status };
});
