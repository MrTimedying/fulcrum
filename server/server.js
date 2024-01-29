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

app.delete("/api/patients", (req, res) => {
    const { ID } = req.query;
    console.log(ID);

    const deleteQuery = `DELETE FROM Patients WHERE ID = ?`;

    // Execute the DELETE query
    db.run(deleteQuery, [ID], (err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            // After successful deletion, fetch the updated data
            res.json({ message: `Patient ${ID} deleted succesfully!`})
            };
        });
    
});


app.get("/api/patientsIntervention", (req, res) => {
    const { ID } = req.query; // Accessing the ID from query parameters

    const query = `
        SELECT Intervention
        FROM Patients
        WHERE ID = ?`;

    db.all(query, ID, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            res.json(data);
        }
    });
});

app.get("/api/icfitems", (req,res) => {

    const { name } = req.query;

    const query = `SELECT * FROM icfitems 
    WHERE category LIKE ? OR label LIKE ?`;

    db.all(query, [`%${name}%`,`%${name}%`], (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            res.json(data);
        }
    })
});

app.post("/api/icfitems", (req,res) => {
    const {
        category,
        label,
        score } = req.body;

        if (!category ||!label ||!score) {
            return res.status(400).json({ error: "All fields are required" });
        };

        const query = `INSERT INTO icfitems (category, label, score) VALUES (?,?,?)`;

        const values = [
            category,
            label,
            score,
        ];
    
        db.run(query, values, function (err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
    
            res.status(201).json({ message: "Item record created", category: category });
        });

    });

app.get("/api/icfitems/details", (req, res) => {
    const { name } = req.query;

    if (!name) {
        return res.status(400).json({ error: "Item category or label is required" });
    }

    // Query the Exercise table in the database based on the provided exercise name
    const query = `SELECT * FROM icfitems 
        WHERE category = ? OR label = ?`;

    db.get(query, [name, name], (err, item) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            if (!item) {
                res.status(404).json({ error: "Item not found" });
            } else {
                res.json(item);
            }
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

app.get("/api/exercises/details", (req, res) => {
    const { name } = req.query;

    if (!name) {
        return res.status(400).json({ error: "Exercise name is required" });
    }

    // Query the Exercise table in the database based on the provided exercise name
    const query = `SELECT * FROM Exercise WHERE Name = ?`;

    db.get(query, [name], (err, exercise) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            if (!exercise) {
                res.status(404).json({ error: "Exercise not found" });
            } else {
                res.json(exercise);
            }
        }
    });
});

app.post("/api/exercises", (req, res) => {
    const {
        name,
        type,
        volume,
        repetitions,
        intensity
    } = req.body;

    if (!name || !type || !volume || !repetitions || !intensity) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const query = `
        INSERT INTO Exercise (Name, Type, Volume, Repetitions, Intensity)
        VALUES (?, ?, ?, ?, ?)
    `;

    const values = [
        name,
        type,
        volume,
        repetitions,
        intensity
    ];

    db.run(query, values, function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        res.status(201).json({ message: "Exercise created", exerciseId: this.lastID });
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

    if (Name && Surname && Age && Gender && BMI && Status && Height && Weight) {

        const query = `
            INSERT INTO Patients (Name, Surname, Age, Gender, BMI, Status, Height, Weight, Intervention)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    } else {
        return res.status(400).json({ error: "All fields are required" });
    } 

    
});

app.post("/api/patientsIntervention", (req, res) => { 

    const {
        intervention,
        ID,
    } = req.body;

    if (intervention && ID) {

        query = `
            UPDATE Patients
            SET Intervention = ?
            WHERE ID = ?`;

        const values = [intervention, ID];

        db.run(query, values, function (err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
        
            res.status(201).json({ message: "Intervention Posted", patientId: this.lastID });
            });
        } else {
            return res.status(400).json({ error: "Either ID or Intervention are missing" });
        };


});

app.patch("/api/patientsIntervention", (req, res) => { 

    if (req.body.ID) {

        query = 'UPDATE Patients SET Intervention = ? WHERE ID = ?';

        const values = ["", req.body.ID];

        db.run(query, values, function (err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Internal Server Error"});
            }

            res.status(201).json({ message: "Intervention Deleted", patientId: this.lastID});
            });
        } else {
            return res.status(400).json({ error: "Couldn't delete the intervention!"})

        };    

});

app.get("/api/patientsDetails", (req, res) => {
    const { ID } = req.query;

    if (!ID || isNaN(ID)) {
        return res.status(400).json({ error: "Invalid or missing ID parameter" });
    };

    const query = `SELECT Name, Surname, Age, Gender, BMI, Height, Weight, Status FROM Patients WHERE ID = ?`;

    if (ID) {
        db.get(query, [ID], (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Internal Server Error"});
            } else {
                res.json(data);
            }
        })
    }
});

app.get("/api/test", (req,res) => {

    const { name } = req.query;

    const query = `SELECT * FROM Test 
    WHERE Name LIKE ?`;

    db.all(query, [`%${name}%`], (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            res.json(data);
        }
    })
});

app.post("/api/test", (req, res) => {
  const { name, type, score, date } = req.body;
  console.log(req.body);

  if (!name || !type || score === undefined || score === null || date === undefined || date === null) {
    return res.status(400).json({ error: "All fields are required" });
  };
  

  const query = `INSERT INTO Test (Name, Type, Score, Date) VALUES (?,?,?,?)`;

  const values = [name, type, score, date];

  db.run(query, values, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    res
      .status(201)
      .json({ message: "Item record created", name: name });
  });
});

app.get("/api/test/details", (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: "Test name is required" });
  }

  // Log the received name and the constructed query
  
  const query = `SELECT * FROM Test WHERE Name = ?`;
  

  db.get(query, [name], (err, item) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      if (!item) {
        res.status(404).json({ error: "Item not found" });
      } else {
        res.json(item);
      }
    }
  });
});

app.get("/api/profile", (req, res) => {
    const { name } = req.query;

    if (!name) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const query = `SELECT * FROM profile WHERE PatientID =?`;

    db.get(query, [name], (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (!data) {
            // No record found for the specified name
            return res.status(404).json({ condition: "No Profile Saved Yet" });
        }

        // Parse JSON strings back into objects
        const parsedData = {
            ...data,
            timeline: data.timeline ? JSON.parse(data.timeline) : [],
            body: data.body ? JSON.parse(data.body) : {},
            activities: data.activities ? JSON.parse(data.activities) : [],
            environment: data.environment ? JSON.parse(data.environment) : {},
            personal: data.personal ? JSON.parse(data.personal) : {},
        };

        res.json(parsedData);
    });
});



app.post("/api/profile", (req, res) => {
    const { ID, timeline, body, activities, environment, personal } = req.body;

    // Check if a profile entry already exists for the given PatientID
    const checkQuery = "SELECT * FROM profile WHERE PatientID = ?";
    db.get(checkQuery, [ID], (checkErr, existingProfile) => {
        if (checkErr) {
            console.error(checkErr);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (existingProfile) {
            // Update the existing profile entry
            const updateQuery = `UPDATE profile SET timeline = ?, body = ?, activities = ?, environment = ?, personal = ? WHERE PatientID = ?`;
            const updateValues = [timeline, body, activities, environment, personal, ID];
            db.run(updateQuery, updateValues, (updateErr) => {
                if (updateErr) {
                    console.error(updateErr);
                    return res.status(500).json({ error: "Internal Server Error" });
                }

                res.status(200).json({ message: "Profile updated", ID: ID });
            });
        } else {
            // Insert a new profile entry
            const insertQuery = `INSERT INTO profile (PatientID, timeline, body, activities, environment, personal) VALUES (?,?,?,?,?,?)`;
            const insertValues = [ID, timeline, body, activities, environment, personal];
            db.run(insertQuery, insertValues, (insertErr) => {
                if (insertErr) {
                    console.error(insertErr);
                    return res.status(500).json({ error: "Internal Server Error" });
                }

                res.status(201).json({ message: "Profile created", ID: ID });
            });
        }
    });
});



      

app.listen(8080);