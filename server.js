const express = require('express');
const cors = require('cors');
const { Rcon } = require('rcon-client');

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

// Handle OPTIONS preflight request
app.options('/execute-command', cors());

app.post('/execute-command', async (req, res) => {
    const { password, command } = req.body;

    // Replace this with your server validation logic
    if (password === '992412') {
        try {
            const rcon = await Rcon.connect({
                host: '192.168.0.26',
                port: 25575,
                password: '992412',
            });

            const response = await rcon.send(command);
            console.log('Minecraft Server Response:', response);

            await rcon.end();

            res.json({ success: true, message: 'Command executed successfully' });
        } catch (error) {
            console.error('Error connecting to RCON:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://192.168.0.26:${port}`);
});
