const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Kết nối MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  port: 3306,
  database: 'myapp'
});

db.connect(err => {
  if (err) {
    console.error('❌ Kết nối MySQL thất bại:', err);
    return;
  }
  console.log('✅ Kết nối MySQL thành công');
});

// API Đăng ký
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. Kiểm tra email tồn tại
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send({ success: false, message: 'Lỗi server' });
      }

      if (results.length > 0) {
        return res.send({ success: false, message: 'Email đã tồn tại' });
      }

      // 2. Mã hóa mật khẩu với bcrypt
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // 3. Lưu user mới vào database
      const newUser = { name, email, password: hashedPassword };
      db.query('INSERT INTO users SET ?', newUser, (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send({ success: false, message: 'Lỗi server' });
        }
        res.send({ 
          success: true, 
          message: 'Đăng ký thành công',
          userId: result.insertId
        });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Lỗi server' });
  }
});

const bcrypt = require('bcrypt');

// API Đăng nhập
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // 1. Kiểm tra email có tồn tại không
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ success: false, message: 'Lỗi server' });
    }

    // 2. Nếu không tìm thấy user
    if (results.length === 0) {
      return res.status(401).send({ 
        success: false, 
        message: 'Email hoặc mật khẩu không đúng' 
      });
    }

    const user = results[0];
    
    try {
      // 3. So sánh mật khẩu nhập vào với mật khẩu đã hash trong DB
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(401).send({ 
          success: false, 
          message: 'Email hoặc mật khẩu không đúng' 
        });
      }

      // 4. Đăng nhập thành công
      res.send({ 
        success: true, 
        message: 'Đăng nhập thành công',
        user: {
          id: user.id,
          name: user.name,
          email: user.email
          // Không trả về password
        }
      });
      
    } catch (error) {
      console.error(error);
      res.status(500).send({ success: false, message: 'Lỗi server' });
    }
  });
});

const PORT = 3000;
app.listen(PORT, '192.168.0.102', () => {
  console.log(`Server chạy tại http://192.168.0.102:${PORT}`);
});
