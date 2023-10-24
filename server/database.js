const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('fulcrum.db');

function initializeDatabase() {
  db.serialize(() => {
    // Check if the "Patients" table exists
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='Patients'", (err, table) => {
      if (!table) {
        // Create the "Patients" table with specified fields
        db.run('CREATE TABLE Patients (ID INTEGER PRIMARY KEY, Name TEXT, Surname TEXT, Age INTEGER, Gender TEXT, Height REAL, Weight REAL, BMI REAL, Status TEXT)');
      }
    });
  });
}

module.exports = { db, initializeDatabase };