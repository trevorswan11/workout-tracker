const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 =  require('sqlite3').verbose()
const app = express();
const db = new sqlite3.Database('/home/trevor/Projects/workout-tracker/Data/workout.db')

app.use(bodyParser.json());
app.use(express.static('public'));

// Define a route for the root url
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Create the Database
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS workouts (id INTEGER PRIMARY KEY, exercise TEXT, duration INTEGER, date TEXT)")
});

// Endpoint to get all workouts
app.get('/api/workouts', (req, res) => {
  db.all("SELECT * FROM workouts", (err, rows) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(rows);
    }
  });
});

// Endpoint to add a workout
app.post('/api/workouts', (req, res) => {
  const { exercise, duration } = req.body;
  const date = new Date().toISOString();
  db.run("INSERT INTO workouts (exercise, duration, date) VALUES (?, ?, ?)", [exercise, duration, date], function(err) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send({ id: this.lastID });
    }
  });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
