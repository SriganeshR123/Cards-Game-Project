const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

// Create an Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL connection setup
const pool = new Pool({
  user: 'postgres', // Replace with your PostgreSQL username
  host: 'localhost',    // Or your database host
  database: 'postgres', // Replace with your database name
  password: 'sriganesh', // Replace with your PostgreSQL password
  port: 5432, // Default PostgreSQL port
});

// Test database connection
pool.connect((err) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Connected to the PostgreSQL database');
  }
});

// Routes

// Health check route
app.get('/', (req, res) => {
  res.send('Least Count Backend is running!');
});

// Create a new game session
app.post('/api/game-sessions', async (req, res) => {
  const { players } = req.body; // Expect an array of player names

  try {
    const result = await pool.query(
      `INSERT INTO game_sessions (players, game_state) VALUES ($1, $2) RETURNING *`,
      [players, {}] // Default empty game state
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating game session:', err);
    res.status(500).json({ error: 'Failed to create game session' });
  }
});

// Get all game sessions
app.get('/api/game-sessions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM game_sessions ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching game sessions:', err);
    res.status(500).json({ error: 'Failed to fetch game sessions' });
  }
});

// Update game state
app.put('/api/game-sessions/:id', async (req, res) => {
  const { id } = req.params;
  const { gameState } = req.body;

  try {
    const result = await pool.query(
      `UPDATE game_sessions SET game_state = $1 WHERE id = $2 RETURNING *`,
      [gameState, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Game session not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error updating game state:', err);
    res.status(500).json({ error: 'Failed to update game state' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
