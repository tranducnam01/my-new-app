const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const app = express();
app.use(bodyParser.json());
app.use(cors());

// Kết nối MySQL
const db = mysql.createConnection({
  host: '127.0.0.1',
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
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send({ success: false, message: 'Email hoặc mật khẩu không đúng' });

    // ✅ Tạo JWT token sau khi xác thực thành công
    const token = jwt.sign({ id: user.id }, 'YOUR_SECRET_KEY', { expiresIn: '7d' });

    db.query('UPDATE users SET Token = ? WHERE UserId = ?', [token, user.UserId], (updateErr) => {
      if (updateErr) {
        console.error(updateErr);
        return res.status(500).send({ success: false, message: 'Lỗi khi lưu token' });
      }
    
    res.send({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.UserId,
        name: user.name,
        email: user.email
      }
    });
    });
  });
});



// API lấy danh mục sản phẩmcategories
app.get('/api/categories', (req, res) => {
    db.query('SELECT * FROM categories', (err, results) => {
    if (err) {
     throw err;
    }
    console.log('✅ Đã lấy danh mục:', results);
    res.send(results);
  });
});


// API lấy danh sách sản phẩm (theo categoryId nếu có)
app.get('/api/products', (req, res) => {
  const { categoryId } = req.query;

  let sql = 'SELECT * FROM products';
  let params = [];

  if (categoryId) {
    sql += ' WHERE CategoryId = ?';
    params.push(categoryId);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('❌ Lỗi lấy sản phẩm:', err);
      return res.status(500).send({ success: false, message: 'Lỗi server' });
    }
    console.log('✅ Đã lấy sản phẩm:', results);
    res.send(results);
  });
});


//thêm vào product vào cart

app.post('/api/cart/add', (req, res) => {
  const { userId, items } = req.body;

  if (!userId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).send({ error: 'Thiếu dữ liệu đầu vào' });
  }

  const item = items[0];
  const { productId, quantity } = item;

  // Bước 1: Lấy thông tin tồn kho của sản phẩm
  db.query('SELECT Pieces FROM products WHERE ProductId = ?', [productId], (err, results) => {
    if (err) {
      console.error("❌ MySQL Error:", err);
      return res.status(500).send({ error: 'Lỗi khi truy vấn sản phẩm' });
    }

    if (results.length === 0) {
      return res.status(404).send({ error: 'Sản phẩm không tồn tại' });
    }

    const availablePieces = results[0].Pieces;

    // Bước 2: Kiểm tra tồn kho
    if (quantity > availablePieces) {
      return res.status(400).send({ error: 'Không đủ hàng trong kho' });
    }

    // Bước 3: Thêm vào bảng cart
    const query = 'INSERT INTO cart (UserId, ProductId, Quantity, pieces) VALUES (?, ?, ?, ?)';
    const values = [userId, productId, quantity, availablePieces];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error("❌ MySQL Error:", err);
        return res.status(500).send({ error: err.message });
      }
    
      // ✅ Cập nhật lại số lượng tồn kho trong bảng products
      const newPieces = availablePieces - quantity;
      db.query('UPDATE products SET Pieces = ? WHERE ProductId = ?', [newPieces, productId], (updateErr) => {
        if (updateErr) {
          console.error("❌ Lỗi khi cập nhật tồn kho:", updateErr);
          return res.status(500).send({ error: 'Lỗi khi cập nhật tồn kho' });
        }
    
        res.send({ success: true, insertedId: result.insertId });
      });
    });
      });
});


// Xóa product khỏi cart và hoàn lại piecse trong
app.post('/api/cart/delete', (req, res) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({ error: "Thiếu userId hoặc productId" });
  }

  // B1: Lấy số lượng đang có trong cart
  db.query(
    'SELECT Quantity FROM cart WHERE UserId = ? AND ProductId = ? AND trangthai = 0',
    [userId, productId],
    (err, results) => {
      if (err) {
        console.error("❌ Lỗi khi truy vấn cart:", err);
        return res.status(500).json({ error: "Lỗi server" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Không tìm thấy sản phẩm trong cart" });
      }

      const quantityInCart = results[0].Quantity;

      // B2: Xóa khỏi bảng cart
      db.query(
        'DELETE FROM cart WHERE UserId = ? AND ProductId = ? AND trangthai = 0',
        [userId, productId],
        (err, deleteResult) => {
          if (err) {
            console.error("❌ Lỗi khi xóa sản phẩm:", err);
            return res.status(500).json({ error: "Lỗi server" });
          }

          // B3: Cộng lại tồn kho cho sản phẩm
          db.query(
            'UPDATE products SET Pieces = Pieces + ? WHERE ProductId = ?',
            [quantityInCart, productId],
            (updateErr) => {
              if (updateErr) {
                console.error("❌ Lỗi khi hoàn tồn kho:", updateErr);
                return res.status(500).json({ error: "Lỗi cập nhật tồn kho" });
              }

              res.status(200).json({ message: "✅ Đã xóa sản phẩm và hoàn kho thành công" });
            }
          );
        }
      );
    }
  );
});


// API cập nhật số lượng sản phẩm trong cart
app.post('/api/cart/update', (req, res) => {
  const { userId, productId, quantity } = req.body;

  if (!userId || !productId || quantity === undefined) {
    return res.status(400).send({ success: false, message: 'Thiếu dữ liệu đầu vào' });
  }

  // Cập nhật số lượng trong cart
  db.query(
    'UPDATE cart SET Quantity = ? WHERE UserId = ? AND ProductId = ? AND trangthai = 0',
    [quantity, userId, productId],
    (err, result) => {
      if (err) {
        console.error('❌ Lỗi khi cập nhật giỏ hàng:', err);
        return res.status(500).send({ success: false, message: 'Lỗi server' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).send({ success: false, message: 'Không tìm thấy sản phẩm trong giỏ hàng' });
      }

      res.send({ success: true, message: '✅ Đã cập nhật giỏ hàng thành công' });
    }
  );
});






app.listen(3000, '0.0.0.0', () => {
  console.log('Server is running on 0.0.0.0:3000');
});


