const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('fulcrum.db');

function initializeDatabase() {
  db.serialize(() => {
    // Create the "Patients" table
    db.run(`
      CREATE TABLE IF NOT EXISTS Patients (
        ID           INTEGER PRIMARY KEY AUTOINCREMENT,
        Name         TEXT,
        Surname      TEXT,
        Age          INTEGER,
        Gender       TEXT,
        Height       REAL,
        Weight       REAL,
        BMI          REAL,
        Status       TEXT,
        Intervention TEXT
      )
    `);

    // Create the "Exercise" table
    db.run(`
      CREATE TABLE IF NOT EXISTS Exercise (
        ID          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT,
        type        TEXT,
        volume      INTEGER,
        repetitions TEXT,
        intensity   INTEGER
      )
    `);

    // Create the "Test" table
    db.run(`
      CREATE TABLE IF NOT EXISTS Test (
        ID    INTEGER PRIMARY KEY AUTOINCREMENT,
        Name  TEXT,
        Type  TEXT,
        Score NUMERIC,
        Date  TEXT
      )
    `);

    // Create the "icfitems" table
    db.run(`
      CREATE TABLE IF NOT EXISTS icfitems (
        category TEXT PRIMARY KEY UNIQUE,
        label    TEXT,
        score    INTEGER
      )
    `);

    // Create the "profile" table
    db.run(`
      CREATE TABLE IF NOT EXISTS profile (
        ID          INTEGER PRIMARY KEY AUTOINCREMENT,
        PatientID   INTEGER REFERENCES Patients (ID) ON DELETE CASCADE,
        timeline    TEXT,
        body        TEXT,
        activities  TEXT,
        environment TEXT,
        personal    TEXT
      )
    `);
  });
}

module.exports = { db, initializeDatabase };