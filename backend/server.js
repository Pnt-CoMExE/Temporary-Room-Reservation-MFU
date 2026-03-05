const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/api/meal-plans', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM meal_plans');
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});