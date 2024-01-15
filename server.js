const express = require('express');
const cors = require('cors');
const { Rcon } = require('rcon-client');
const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const app = express();
const port = 80;

app.use(cors());
app.use(express.json());

// Handle OPTIONS preflight request
app.options('/execute-command', cors());

// Use lowdb with a JSON file as a storage solution
const adapter = new FileSync('db.json');
const db = low(adapter);

// Set up the database schema
db.defaults({ users: {} }).write();

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Replace this with your server validation logic
    const user = db.get(`users.${username}`).value();

    if (user && user.password === password) {
        res.json({ success: true, points: user.points });
    } else {
        res.json({ success: false, message: 'Invalid credentials' });
    }
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Check if the username is already taken
    if (db.get(`users.${username}`).value()) {
        res.status(400).json({ success: false, message: 'Username already taken' });
    } else {
        // Store the new user in the database
        db.set(`users.${username}`, { password, points: 100 }).write();
        res.json({ success: true, message: 'Registration successful' });
    }
});


app.post('/execute-command', async (req, res) => {
    const { username, password, command } = req.body;

    // Replace this with your server validation logic
    const user = db.get(`users.${username}`).value();

    if (user && user.password === password) {
        try {
            const rcon = await Rcon.connect({
                host: '192.168.0.26',
                port: 25575,
                password: '992412', // Use the RCON password here
            });

            const response = await rcon.send(command);
            console.log('Minecraft Server Response:', response);

            await rcon.end();

            // Deduct 10 points after executing the command
            db.set(`users.${username}.points`, user.points - 10).write();

            res.json({ success: true, message: 'Command executed successfully', points: user.points - 10 });
        } catch (error) {
            console.error('Error connecting to RCON:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'test2.html'));
});

app.listen(port, () => {
    console.log(`Server running on https://model-moderately-grubworm.ngrok-free.app`);
});
