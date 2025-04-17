const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
  console.log(`📥 Request nhận được: ${req.method} ${req.url}`);
  next();
});


// Kết nối MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',       // đổi theo tài khoản MySQL của bạn
  password: '',       // mật khẩu MySQL
  database: 'myapp'   // tên database
});

db.connect(err => {
  if (err) {
    console.error('❌ Kết nối MySQL thất bại:', err);
    return;
  }
  console.log('✅ Kết nối MySQL thành công');
});

// Tạo bảng nếu chưa có


// API ĐĂNG KÝ
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
  
    // Kiểm tra email
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, emailResults) => {
      if (err) return res.status(500).json({ message: 'Lỗi server', error: err });
      if (emailResults.length > 0) return res.status(400).json({ message: 'Email đã được sử dụng' });
  
      // Kiểm tra username
      db.query('SELECT * FROM users WHERE name = ?', [name], async (err, nameResults) => {
        if (err) return res.status(500).json({ message: 'Lỗi server', error: err });
        if (nameResults.length > 0) return res.status(400).json({ message: 'Tên người dùng đã tồn tại' });
  
        // Hash và insert nếu mọi thứ ổn
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
  
//API ĐĂNG NHẬP
app.post('/login',async (req, res) => {
  console.log('✅ Nhận được request /login');
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Lỗi server', error: err });
    if (results.length === 0) return res.status(400).json({ message: 'Email không tồn tại' });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Sai mật khẩu' });

    res.status(200).json({ message: 'Đăng nhập thành công', user });
  });
});


 
const PORT = 3000;
app.listen(PORT,'0.0.0.0', () => {
  console.log(` Server chạy tại http://localhost:${PORT}`);
});
