const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));  // Serve the static HTML file

// Initialize the SQLite database
let db = new sqlite3.Database('./Data/workout.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the workout database.');
});

// Create the workouts table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workoutName TEXT,
    date TEXT,
    set1 TEXT,
    set2 TEXT,
    set3 TEXT,
    set4 TEXT,
    set5 TEXT
)`);

// API to save workouts to the database
app.post('/api/saveWorkouts', (req, res) => {
    const workouts = req.body;

    // SQL query to insert data
    const insertWorkoutQuery = `
        INSERT INTO workouts (workoutName, date, set1, set2, set3, set4, set5)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    // Loop through workouts and insert each one into the database
    workouts.forEach(workout => {
        const { workoutName, date, sets } = workout;

        // Ensure each set has a default value of '--' if not provided
        const set1 = sets[0] || '--';
        const set2 = sets[1] || '--';
        const set3 = sets[2] || '--';
        const set4 = sets[3] || '--';
        const set5 = sets[4] || '--';

        db.run(insertWorkoutQuery, [workoutName, date, set1, set2, set3, set4, set5], function (err) {
            if (err) {
                console.error('Error saving workout data:', err.message);
                return res.status(500).json({ error: 'Failed to save workout data', details: err.message });
            }
            console.log(`Workout saved with ID: ${this.lastID}`);
        });
    });
});

// API to retrieve all workouts from the database
app.get('/api/getWorkouts', (req, res) => {
    const query = `SELECT * FROM workouts`;

    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to retrieve workouts' });
        }
        res.status(200).json(rows);
    });
});

// API to delete a workout by ID
app.delete('/api/deleteWorkout/:id', (req, res) => {
    const workoutId = req.params.id;

    db.run(`DELETE FROM workouts WHERE id = ?`, workoutId, function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete workout' });
        }

        res.status(200).json({ message: 'Workout deleted successfully' });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});