const express = require('express');
const cors = require('cors'); // Import the cors middleware
const { db } = require('./database');

const app = express();

// Enable CORS for all routes
app.use(cors());

app.get("/api/patients", (req, res) => {
    db.all("SELECT * FROM Patients", (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            res.json(data);
        }
    });
});

app.get("/api/exercises", (req, res) => {
    db.all("SELECT * FROM Exercise", (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            res.json(data);
        }
    });
});

app.get("/api/tests", (req, res) => {
    db.all("SELECT * FROM Test", (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            res.json(data);
        }
    });
});

app.get('/test', (req, res) => {
    res.json({ message: 'Test API endpoint reached' });
});

app.listen(8080);