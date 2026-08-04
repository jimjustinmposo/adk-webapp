const express = require('express');
const pool = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken); // every dog route requires login

// GET /api/dogs?search=term
router.get('/', async (req, res) => {
  const { search } = req.query;
  try {
    let result;
    if (search) {
      result = await pool.query(
        `SELECT * FROM dogtb
         WHERE dogname ILIKE $1 OR breed ILIKE $1 OR nickname ILIKE $1 OR microchip ILIKE $1
         ORDER BY dogid`,
        [`%${search}%`]
      );
    } else {
      result = await pool.query('SELECT * FROM dogtb ORDER BY dogid');
    }
    res.json({ dogs: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dogs.' });
  }
});

// POST /api/dogs  -- any logged-in user (admin or not) can add
router.post('/', async (req, res) => {
  const { breed, dogname, nickname, gender, dob, microchip, father, mother, comment, status, photo } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO dogtb (breed, dogname, nickname, gender, dob, microchip, father, mother, comment, status, photo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,COALESCE($10,'active'),$11)
       RETURNING *`,
      [breed, dogname, nickname, gender, dob || null, microchip, father, mother, comment, status, photo || null]
    );
    res.status(201).json({ dog: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add dog.' });
  }
});

// PUT /api/dogs/:id  -- admin only
router.put('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { breed, dogname, nickname, gender, dob, microchip, father, mother, comment, status, photo } = req.body;
  try {
    const result = await pool.query(
      `UPDATE dogtb SET breed=$1, dogname=$2, nickname=$3, gender=$4, dob=$5,
       microchip=$6, father=$7, mother=$8, comment=$9, status=$10, photo=$11
       WHERE dogid=$12 RETURNING *`,
      [breed, dogname, nickname, gender, dob || null, microchip, father, mother, comment, status || 'active', photo || null, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Dog not found.' });
    res.json({ dog: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update dog.' });
  }
});

// DELETE /api/dogs/:id  -- admin only
router.delete('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM dogtb WHERE dogid=$1 RETURNING dogid', [id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Dog not found.' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete dog.' });
  }
});

module.exports = router;
