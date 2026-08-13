const express = require('express');
const pool = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken); // every dog route requires login

const DOG_SELECT = `SELECT d.*, sd.disposition_date, sd.contact_name AS disposition_contact_name,
  sd.contact_address AS disposition_contact_address, sd.contact_details AS disposition_contact_details
  FROM dogtb d
  LEFT JOIN dog_status_details sd ON sd.dogid = d.dogid`;

function getDispositionDetails(body) {
  const status = (body.status || 'active').toLowerCase();
  if (!['active', 'deceased', 'sold', 'adopted'].includes(status)) {
    throw new Error('Status must be Active, Deceased, Sold, or Adopted.');
  }
  if (!['sold', 'adopted'].includes(status)) return { status, details: null };

  const details = {
    date: body.disposition_date,
    name: (body.disposition_contact_name || '').trim(),
    address: (body.disposition_contact_address || '').trim(),
    contact: (body.disposition_contact_details || '').trim()
  };
  if (!details.date || !details.name || !details.address || !details.contact) {
    throw new Error(`Complete ${status === 'sold' ? 'buyer' : 'adopter'} details are required.`);
  }
  return { status, details };
}

async function saveDispositionDetails(client, dogid, status, details) {
  await client.query('DELETE FROM dog_status_details WHERE dogid=$1', [dogid]);
  if (!details) return;
  await client.query(
    `INSERT INTO dog_status_details
      (dogid, disposition_type, disposition_date, contact_name, contact_address, contact_details)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [dogid, status, details.date, details.name, details.address, details.contact]
  );
}

// GET /api/dogs?search=term
router.get('/', async (req, res) => {
  const { search } = req.query;
  try {
    let result;
    if (search) {
      result = await pool.query(
        `${DOG_SELECT}
         WHERE d.dogname ILIKE $1 OR d.breed ILIKE $1 OR d.nickname ILIKE $1 OR d.microchip ILIKE $1
         ORDER BY d.dogid`,
        [`%${search}%`]
      );
    } else {
      result = await pool.query(`${DOG_SELECT} ORDER BY d.dogid`);
    }
    res.json({ dogs: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dogs.' });
  }
});

// POST /api/dogs  -- any logged-in user (admin or not) can add
router.post('/', async (req, res) => {
  const { breed, dogname, nickname, gender, dob, microchip, father, mother, comment, photo } = req.body;
  let client;
  try {
    const { status, details } = getDispositionDetails(req.body);
    client = await pool.connect();
    await client.query('BEGIN');
    const result = await client.query(
      `INSERT INTO dogtb (breed, dogname, nickname, gender, dob, microchip, father, mother, comment, status, photo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,COALESCE($10,'active'),$11)
       RETURNING *`,
      [breed, dogname, nickname, gender, dob || null, microchip, father, mother, comment, status, photo || null]
    );
    await saveDispositionDetails(client, result.rows[0].dogid, status, details);
    const dog = await client.query(`${DOG_SELECT} WHERE d.dogid=$1`, [result.rows[0].dogid]);
    await client.query('COMMIT');
    res.status(201).json({ dog: dog.rows[0] });
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error(err);
    res.status(err.message.includes('required.') || err.message.startsWith('Status must') ? 400 : 500)
      .json({ error: err.message.includes('required.') || err.message.startsWith('Status must') ? err.message : 'Failed to add dog.' });
  } finally {
    if (client) client.release();
  }
});

// PUT /api/dogs/:id  -- admin only
router.put('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { breed, dogname, nickname, gender, dob, microchip, father, mother, comment, photo } = req.body;
  let client;
  try {
    const { status, details } = getDispositionDetails(req.body);
    client = await pool.connect();
    await client.query('BEGIN');
    const result = await client.query(
      `UPDATE dogtb SET breed=$1, dogname=$2, nickname=$3, gender=$4, dob=$5,
       microchip=$6, father=$7, mother=$8, comment=$9, status=$10, photo=$11
       WHERE dogid=$12 RETURNING *`,
      [breed, dogname, nickname, gender, dob || null, microchip, father, mother, comment, status, photo || null, id]
    );
    if (!result.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Dog not found.' });
    }
    await saveDispositionDetails(client, id, status, details);
    const dog = await client.query(`${DOG_SELECT} WHERE d.dogid=$1`, [id]);
    await client.query('COMMIT');
    res.json({ dog: dog.rows[0] });
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error(err);
    res.status(err.message.includes('required.') || err.message.startsWith('Status must') ? 400 : 500)
      .json({ error: err.message.includes('required.') || err.message.startsWith('Status must') ? err.message : 'Failed to update dog.' });
  } finally {
    if (client) client.release();
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
