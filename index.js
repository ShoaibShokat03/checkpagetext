const express = require('express');
const config = require('./app.config');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/check-text', async (req, res) => {
    // Use URL from query parameter if provided, otherwise fallback to config
    const targetUrl = req.query.url || config.target_url;

    if (!targetUrl) {
        return res.status(400).json({ error: 'Please provide a target_url in app.config.js or via ?url= query parameter' });
    }

    try {
        // Fetch the webpage content
        const response = await fetch(targetUrl);
        const html = await response.text();

        // Check if target text exists
        if (html.includes(config.target_text)) {
            // Send notification to ntfy.sh
            const ntfyResponse = await fetch(`https://ntfy.sh/${config.ntfy_topic}`, {
                method: 'POST',
                body: `Found "${config.target_text}" on ${targetUrl}`,
                headers: {
                    'Title': 'Target Text Found!'
                }
            });

            if (!ntfyResponse.ok) {
                console.error('Failed to send ntfy message:', await ntfyResponse.text());
                return res.status(500).json({ error: 'Found text but failed to send notification' });
            }

            return res.json({ success: true, message: 'Text found and notification sent!' });
        }

        return res.json({ success: true, message: `[${config.target_text}]Text not found.` });

    } catch (error) {
        console.error('Error fetching webpage:', error);
        return res.status(500).json({ error: 'Failed to fetch the webpage content.' });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log(`Trigger a check by visiting: /check-text`);
});
