require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

// Setup connection pool using DATABASE_URL or individual env vars
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Auto-create table if missing
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        is_done BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log("Database table 'todos' is ready.");
  } catch (err) {
    console.error("Error creating database table:", err);
  }
};
initDb();

const app = express();

app.use(cors());
app.use(express.json());

// Get all to-do items
app.get('/api/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Add a new to-do item
app.post('/api/todos', async (req, res) => {
  const title = (req.body.title || '').trim();

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO todos (title) VALUES ($1) RETURNING *',
      [title]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark a task done or not done
app.patch('/api/todos/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE todos SET is_done = NOT is_done WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a to-do item
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM todos WHERE id = $1',
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log('API listening on port ' + port);
});