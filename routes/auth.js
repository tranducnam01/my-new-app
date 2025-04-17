const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

// API ĐĂNG KÝ
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, emailResults) => {
    if (err) return res.status(500).json({ message: 'Lỗi server', error: err });
    if (emailResults.length > 0) return res.status(400).json({ message: 'Email đã được sử dụng' });

    db.query('SELECT * FROM users WHERE name = ?', [name], async (err, nameResults) => {
      if (err) return res.status(500).json({ message: 'Lỗi server', error: err });
      if (nameResults.length > 0) return res.status(400).json({ message: 'Tên người dùng đã tồn tại' });

      const hashedPassword = await bcrypt.hash(password, 10);
      db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword],
        (err, result) => {
          if (err) return res.status(500).json({ message: 'Không thể tạo tài khoản', error: err });
          res.status(201).json({ message: 'Tạo tài khoản thành công' });
        });
    });
  });
});

module.exports = router;
