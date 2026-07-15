// HTTP-triggered check. Visit /.netlify/functions/check-text (optionally ?url=...) to run manually.
const { runCheck } = require('./lib/checker');

exports.handler = async (event) => {
    const overrideUrl = event.queryStringParameters && event.queryStringParameters.url;
    const result = await runCheck(overrideUrl);

    return {
        statusCode: result.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.body),
    };
};
