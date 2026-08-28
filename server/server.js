require('dotenv').config();

const express = require('express');
const pool = require('./db');

const app = express();

app.use(express.json());

// Get all to-do items, newest first
app.get('/api/todos', async (req, res) => {
  const result = await pool.query('SELECT * FROM todos ORDER BY id DESC');
  res.json(result.rows);
});

// Add a new to-do item
app.post('/api/todos', async (req, res) => {
  const title = (req.body.title || '').trim();

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const result = await pool.query(
    'INSERT INTO todos (title) VALUES ($1) RETURNING *',
    [title]
  );

  res.status(201).json(result.rows[0]);
});

// Mark a task done or not done
app.patch('/api/todos/:id', async (req, res) => {
  const result = await pool.query(
    'UPDATE todos SET is_done = NOT is_done WHERE id = $1 RETURNING *',
    [req.params.id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Not found' });
  }

  res.json(result.rows[0]);
});

// Delete a to-do item
app.delete('/api/todos/:id', async (req, res) => {
  const result = await pool.query(
    'DELETE FROM todos WHERE id = $1',
    [req.params.id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Not found' });
  }

  res.status(204).end();
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log('API listening on port ' + port);
});