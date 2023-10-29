const express = require('express');
const cors = require('cors'); // Import the cors middleware
const { db } = require('./database');

const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

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

/* I will list here instead all the POST methods */

app.post("/api/patients", (req, res) => {
    const {
        Name,
        Surname,
        Age,
        Gender,
        BMI,
        Status,
        Height,
        Weight
    } = req.body;

    if (!Name || !Surname || !Age || !Gender || !BMI || !Status || !Height || !Weight) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const query = `
        INSERT INTO Patients (Name, Surname, Age, Gender, BMI, Status, Height, Weight)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        Name,
        Surname,
        Age,
        Gender,
        BMI,
        Status,
        Height,
        Weight
    ];

    db.run(query, values, function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        res.status(201).json({ message: "Patient created", patientId: this.lastID });
    });
});

app.listen(8080);