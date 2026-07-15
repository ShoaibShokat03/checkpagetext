// Shared page-check logic used by both the HTTP and scheduled functions.
const config = require('../../../app.config');

async function runCheck(overrideUrl) {
    const targetUrl = overrideUrl || config.target_url;

    if (!targetUrl) {
        return { status: 400, body: { error: 'No target_url configured in app.config.js and no ?url= provided.' } };
    }

    try {
        const response = await fetch(targetUrl);
        const html = await response.text();

        if (html.includes(config.target_text)) {
            const ntfyResponse = await fetch(`https://ntfy.sh/${config.ntfy_topic}`, {
                method: 'POST',
                body: `Found "${config.target_text}" on ${targetUrl}`,
                headers: { Title: 'Target Text Found!' },
            });

            if (!ntfyResponse.ok) {
                console.error('Failed to send ntfy message:', await ntfyResponse.text());
                return { status: 500, body: { error: 'Found text but failed to send notification' } };
            }

            return { status: 200, body: { success: true, found: true, message: 'Text found and notification sent!' } };
        }

        return { status: 200, body: { success: true, found: false, message: 'Text not found.' } };
    } catch (error) {
        console.error('Error fetching webpage:', error);
        return { status: 500, body: { error: 'Failed to fetch the webpage content.' } };
    }
}

module.exports = { runCheck };
