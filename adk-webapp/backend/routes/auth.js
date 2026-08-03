const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const result = await pool.query('SELECT * FROM logintb WHERE username = $1', [username]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid username or password.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid username or password.' });

    const token = jwt.sign(
      { id: user.id, nickname: user.nickname, adminrights: user.adminrights },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        nickname: user.nickname,
        designation: user.designation,
        adminrights: user.adminrights
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// POST /api/auth/verify-admin-password
// Gate for reaching the "Create New Account" page.
router.post('/verify-admin-password', (req, res) => {
  const { password } = req.body;
  if (password && password === process.env.ADMIN_PASSWORD) {
    return res.json({ valid: true });
  }
  return res.status(401).json({
    valid: false,
    message: 'Incorrect admin password. Contact Jim Justin M. Poso at 0501905318.'
  });
});

// POST /api/auth/register
// Creates a new login account. Requires the admin password again server-side
// so this endpoint can't be called directly without it, even if someone
// bypasses the frontend gate page.
router.post('/register', async (req, res) => {
  const { adminPassword, fullname, nickname, designation, username, password, adminrights } = req.body;

  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Admin password verification failed.' });
  }
  if (!fullname || !nickname || !username || !password) {
    return res.status(400).json({ error: 'Full name, nickname, username, and password are required.' });
  }

  try {
    const existing = await pool.query('SELECT id FROM logintb WHERE username = $1', [username]);
    if (existing.rows.length) {
      return res.status(409).json({ error: 'That username is already taken.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO logintb (fullname, nickname, designation, username, password, adminrights)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, fullname, nickname, designation, username, adminrights`,
      [fullname, nickname, designation || null, username, hash, !!adminrights]
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error creating account.' });
  }
});

module.exports = router;
