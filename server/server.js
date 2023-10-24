const express = require('express');
const { initializeDatabase, db } = require('./database');

initializeDatabase();

const app = express();

app.get("/api/dbendpoint", (req, res) => {
    console.log("The endpoint is working!");
});

app.get("/api", (req, res) => {
    res.send('Hello World!');
});

app.listen(8080);