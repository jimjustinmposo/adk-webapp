const express = require('express');
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const [total, active, deceased, byBreed, byGender, missing] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM dogtb'),
      pool.query(`SELECT COUNT(*) FROM dogtb WHERE status = 'active'`),
      pool.query(`SELECT COUNT(*) FROM dogtb WHERE status = 'deceased'`),
      pool.query(`SELECT COALESCE(breed, 'Unknown') AS breed, COUNT(*) FROM dogtb GROUP BY breed ORDER BY COUNT(*) DESC`),
      pool.query(`SELECT COALESCE(gender, 'Unknown') AS gender, COUNT(*) FROM dogtb GROUP BY gender`),
      pool.query(`SELECT COUNT(*) FROM dogtb WHERE
        breed IS NULL OR breed = '' OR dogname IS NULL OR dogname = '' OR
        gender IS NULL OR gender = '' OR dob IS NULL OR
        microchip IS NULL OR microchip = '' OR father IS NULL OR father = '' OR
        mother IS NULL OR mother = ''`)
    ]);

    res.json({
      totalDogs: Number(total.rows[0].count),
      activeDogs: Number(active.rows[0].count),
      deceasedDogs: Number(deceased.rows[0].count),
      dogsByBreed: byBreed.rows.map(r => ({ breed: r.breed, count: Number(r.count) })),
      dogsByGender: byGender.rows.map(r => ({ gender: r.gender, count: Number(r.count) })),
      dogsWithMissingInfo: Number(missing.rows[0].count)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load dashboard stats.' });
  }
});

module.exports = router;
