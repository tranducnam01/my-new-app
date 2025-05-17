const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');


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
const util = require('util');
db.query = util.promisify(db.query); // Cho phép dùng await db.query()


// Cấu hình Nodemailer
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'keviendebruyne1123@gmail.com', // Thay bằng email của bạn
    pass: 'zhayejzuywokveiz', // Thay bằng App Password
  },
});
// Hàm gửi email
const sendOrderConfirmationEmail = async (to, orderId, cartItems, totalAmount, address, phoneNumber, paymentMethod, note) => {
  const productList = cartItems
    .map(
      item => `
        <li>
          Sản phẩm ID: ${item.productId}<br/>
          Số lượng: ${item.quantity}<br/>
          Giá: ${item.price} VND<br/>
          Tổng: ${item.amount} VND
        </li>
      `
    )
    .join('');

  const mailOptions = {
    from: '"Cửa hàng của bạn" <your-email@gmail.com>',
    to,
    subject: `Xác nhận đơn hàng #${orderId}`,
    html: `
      <h2>Cảm ơn bạn đã đặt hàng!</h2>
      <p>Đơn hàng của bạn đã được ghi nhận. Dưới đây là chi tiết:</p>
      <ul>
        <li><strong>Mã đơn hàng:</strong> ${orderId}</li>
        <li><strong>Địa chỉ giao hàng:</strong> ${address}</li>
        <li><strong>Số điện thoại:</strong> ${phoneNumber}</li>
        <li><strong>Phương thức thanh toán:</strong> ${paymentMethod === 'offline' ? 'Thanh toán tại nhà' : 'Thanh toán qua VNPay'}</li>
        <li><strong>Ghi chú:</strong> ${note || 'Không có'}</li>
      </ul>
      <h3>Chi tiết sản phẩm:</h3>
      <ul>${productList}</ul>
      <p><strong>Tổng tiền:</strong> ${totalAmount} VND</p>
      <p>Chúng tôi sẽ xử lý đơn hàng sớm nhất có thể. Cảm ơn bạn!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to} for order ${orderId}`);
  } catch (error) {
    console.error('❌ Lỗi khi gửi email:', error);
  }
};


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



// API reset mật khẩu
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).send({ success: false, message: 'Vui lòng nhập email' });
  }

  try {
    // Kiểm tra email tồn tại
    const userResult = await db.query('SELECT UserId, email FROM users WHERE email = ?', [email]);
    if (userResult.length === 0) {
      return res.status(404).send({ success: false, message: 'Email không tồn tại' });
    }

    const userId = userResult[0].UserId;

    
    // Tạo số ngẫu nhiên 6 chữ số
    const newPassword = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Cập nhật mật khẩu mới vào database
    await db.query('UPDATE users SET password = ? WHERE UserId = ?', [hashedPassword, userId]);

    // Gửi email với mật khẩu mới
    const mailOptions = {
      from: '"Cửa hàng của bạn" <your-email@gmail.com>',
      to: email,
      subject: 'Đặt lại mật khẩu thành công',
      html: `
        <h2>Mật khẩu mới của bạn</h2>
        <p>Mật khẩu mới của bạn là: <strong>${newPassword}</strong></p>
        <p>Vui lòng đăng nhập và thay đổi mật khẩu để bảo mật tài khoản.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Đã gửi email với mật khẩu mới đến ${email}`);

    res.send({ success: true, message: 'Mật khẩu mới đã được gửi đến email của bạn' });
  } catch (err) {
    console.error('❌ Lỗi reset mật khẩu:', err);
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
    const token = jwt.sign({ id: user.UserId }, 'YOUR_SECRET_KEY', { expiresIn: '7d' });

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
  console.log('📥 [API /api/cart/add] Yêu cầu nhận được:', JSON.stringify(req.body, null, 2));
  const { userId, items } = req.body;

  if (!userId || !Array.isArray(items) || items.length === 0) {
    console.error('❌ [API /api/cart/add] Thiếu dữ liệu đầu vào:', { userId, items });
    return res.status(400).send({ error: 'Thiếu dữ liệu đầu vào' });
  }

  const item = items[0];
  const { productId, quantity, pieces, price } = item;

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
    const query = 'INSERT INTO cart (UserId, ProductId, Quantity, pieces,price) VALUES (?, ?, ?, ?,?)';
    const values = [userId, productId, quantity, availablePieces, price];

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


// API lấy giỏ hàng theo userId
app.get('/api/cart/get', (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).send({ success: false, message: 'Thiếu userId' });
  }

  const sql = `
    SELECT 
      cart.ProductId,
      cart.Quantity,
      cart.pieces,
      cart.price,
      products.Name,
      products.Img
    FROM cart
    JOIN products ON cart.ProductId = products.ProductId
    WHERE cart.UserId = ? AND cart.trangthai = 0
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('❌ Lỗi lấy giỏ hàng:', err);
      return res.status(500).send({ success: false, message: 'Lỗi server' });
    }

    res.send(results);
  });
});

// API lưu địa chỉ và tạo đơn hàng
app.post('/api/shipping-address', async (req, res) => {
  const { userId, address, phoneNumber, cartItems, totalAmount, paymentMethod, note } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!userId || !address || !phoneNumber || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).send({ success: false, message: 'Thiếu hoặc không hợp lệ dữ liệu đầu vào' });
  }

  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phoneNumber)) {
    return res.status(400).send({ success: false, message: 'Số điện thoại phải có đúng 10 chữ số' });
  }

  if (!['offline', 'online'].includes(paymentMethod)) {
    return res.status(400).send({ success: false, message: 'Phương thức thanh toán không hợp lệ' });
  }

  if (note && note.length > 200) {
    return res.status(400).send({ success: false, message: 'Ghi chú không được vượt quá 200 ký tự' });
  }

  try {
    // Lấy email người dùng
    const userResult = await db.query('SELECT email FROM users WHERE UserId = ?', [userId]);
    if (userResult.length === 0) {
      return res.status(404).send({ success: false, message: 'Không tìm thấy người dùng' });
    }
    const userEmail = userResult[0].email;

    // Kiểm tra tồn kho
    for (const item of cartItems) {
      const productResult = await db.query('SELECT Pieces FROM products WHERE ProductId = ?', [item.productId]);
      if (productResult.length === 0) {
        return res.status(404).send({ success: false, message: `Sản phẩm ID ${item.productId} không tồn tại` });
      }
      const availablePieces = productResult[0].Pieces;
      if (item.quantity > availablePieces) {
        return res.status(400).send({ success: false, message: `Sản phẩm ID ${item.productId} không đủ hàng` });
      }
    }

    // Tạo đơn hàng
    const order = {
      UserId: userId,
      ShippingAddress: address,
      PhoneNumber: phoneNumber,
      OrderDate: new Date(),
      Status: 'Đang xử lý',
    };
    const orderResult = await db.query('INSERT INTO orders SET ?', order);
    const orderId = orderResult.insertId;

    // Xử lý cartItems
    const orderItems = cartItems.map(item => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      const itemTotal = quantity * price;
      return [orderId, item.productId, quantity, price, itemTotal];
    });

    const calculatedTotal = orderItems.reduce((sum, item) => sum + item[4], 0);
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      return res.status(400).send({ success: false, message: 'Tổng tiền không khớp' });
    }

    // Thêm vào orderitems
    await db.query('INSERT INTO orderitems (OrderId, ProductId, Quantity, Price, totalAmount) VALUES ?', [orderItems]);

    // Cập nhật tồn kho
    for (const item of cartItems) {
      await db.query('UPDATE products SET Pieces = Pieces - ? WHERE ProductId = ?', [item.quantity, item.productId]);
    }

    // Lưu vào bảng payment
    const payment = {
      orderid: orderId,
      userId: userId,
      paymentMethod: paymentMethod,
      address: address,
      phonenumber: phoneNumber,
      note: note || '',
    };
    await db.query('INSERT INTO payment SET ?', payment);

    // Cập nhật trạng thái giỏ hàng
    await db.query('UPDATE cart SET trangthai = 1 WHERE UserId = ? AND trangthai = 0', [userId]);

    // Gửi email xác nhận
    await sendOrderConfirmationEmail(
      userEmail,
      orderId,
      cartItems,
      totalAmount,
      address,
      phoneNumber,
      paymentMethod,
      note
    );

    // Tạo URL VNPay nếu là online
    if (paymentMethod === 'online') {
      const vnpayParams = {
        vnp_TmnCode: 'YOUR_VNPAY_TMN_CODE',
        vnp_Amount: totalAmount * 100,
        vnp_Command: 'pay',
        vnp_CreateDate: new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14),
        vnp_CurrCode: 'VND',
        vnp_IpAddr: '127.0.0.1',
        vnp_Locale: 'vn',
        vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
        vnp_OrderType: 'billpayment',
        vnp_ReturnUrl: 'YOUR_RETURN_URL',
        vnp_TxnRef: orderId,
        vnp_Version: '2.1.0',
      };

      const secretKey = 'YOUR_VNPAY_SECRET_KEY';
      const sortedParams = Object.keys(vnpayParams)
        .sort()
        .reduce((obj, key) => {
          obj[key] = vnpayParams[key];
          return obj;
        }, {});
      const signData = require('querystring').stringify(sortedParams);
      const hmac = crypto.createHmac('sha512', secretKey);
      const vnp_SecureHash = hmac.update(signData).digest('hex');

      const paymentUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?${require('querystring').stringify({
        ...sortedParams,
        vnp_SecureHash,
      })}`;

      return res.send({
        success: true,
        message: 'Tạo đơn hàng thành công',
        orderId,
        paymentUrl,
      });
    }

    // Trả về cho cod
    res.send({
      success: true,
      message: 'Tạo đơn hàng thành công',
      orderId,
    });
  } catch (err) {
    console.error('❌ Lỗi xử lý đơn hàng:', err);
    res.status(500).send({ success: false, message: 'Lỗi server' });
  }
});


app.get('/api/user-info', (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'Thiếu userId' });
  }

  db.query('SELECT UserId, name, email FROM users WHERE UserId = ?', [userId], (err, results) => {
    if (err) {
      console.error('❌ Lỗi truy vấn người dùng:', err);
      return res.status(500).json({ success: false, message: 'Lỗi server' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    res.json({ success: true, user: results[0] });
  });
});

// Đoạn code phía server (Node.js + Express)

app.get('/api/user-purchased-products', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'UserId không được để trống',
    });
  }

  try {
    const purchasedProductsQuery = `
      SELECT 
        p.ProductId, 
        p.Name, 
        p.Price, 
        p.Img, 
        o.OrderId, 
        oi.OrderItemId,
        oi.Quantity, 
        o.Status
      FROM orders o
      JOIN orderitems oi ON o.OrderId = oi.OrderId
      JOIN products p ON oi.ProductId = p.ProductId
      WHERE o.UserId = ? AND o.Status = "Đang xử lý"
    `;

    const results = await db.query(purchasedProductsQuery, [userId]);
    console.log('🔍 [API] Number of records:', results.length);

    return res.status(200).json({
      success: true,
      products: results
    });
  } catch (err) {
    console.error('❌ [API] Database error:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
    });
  }
});



app.get('/api/orders/processed', async (req, res) => {
  const { userId } = req.query;

  console.log('📥 [API /api/orders/processed] Yêu cầu nhận được:', { userId });

  if (!userId) {
    console.error('❌ [API /api/orders/processed] Thiếu userId');
    return res.status(400).send({ error: 'Thiếu userId' });
  }

  try {
    const [orders] = await db.query(`
      SELECT o.OrderId, o.OrderDate, o.Status,
             oi.OrderItemId, oi.Quantity, oi.Price, oi.totalAmount,
             p.ProductId, p.Name, p.Img
      FROM orders o
      LEFT JOIN orderitems oi ON o.OrderId = oi.OrderId
      LEFT JOIN products p ON oi.ProductId = p.ProductId
      WHERE o.UserId = ? AND o.Status = 'Processed'
      ORDER BY o.OrderDate DESC
    `, [userId]);

    // Nhóm dữ liệu theo OrderId
    const groupedOrders = orders.reduce((acc, row) => {
      const order = acc.find(o => o.OrderId === row.OrderId);
      const item = {
        orderItemId: row.OrderItemId,
        productId: row.ProductId,
        name: row.Name,
        quantity: row.Quantity,
        price: row.Price,
        totalAmount: row.totalAmount,
        img: row.Img
      };

      if (order) {
        order.items.push(item);
      } else {
        acc.push({
          OrderId: row.OrderId,
          OrderDate: row.OrderDate,
          Status: row.Status,
          items: row.ProductId ? [item] : []
        });
      }
      return acc;
    }, []);

    console.log('📤 [API /api/orders/processed] Trả về:', groupedOrders);
    res.send({ success: true, orders: groupedOrders });
  } catch (err) {
    console.error('❌ [API /api/orders/processed] Lỗi:', {
      message: err.message,
      stack: err.stack,
      sql: err.sql || 'N/A',
      sqlMessage: err.sqlMessage || 'N/A'
    });
    res.status(500).send({ error: 'Lỗi server' });
  }
});


app.delete('/api/orderitems/delete', async (req, res) => {
  const { userId, orderItemId } = req.body;

  if (!userId || !orderItemId) {
    return res.status(400).json({ success: false, error: 'Thiếu userId hoặc orderItemId' });
  }

  try {
    // Lấy thông tin order item
    const orderItemRows = await db.query('SELECT OrderId, ProductId FROM orderitems WHERE OrderItemId = ?', [orderItemId]);
    if (orderItemRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy order item' });
    }

    const { OrderId, ProductId } = orderItemRows[0];

    // Kiểm tra trạng thái đơn hàng
    const orderRows = await db.query('SELECT Status FROM orders WHERE OrderId = ?', [OrderId]);
    if (orderRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy đơn hàng' });
    }

    if (orderRows[0].Status === 'Processed') {
      return res.status(400).json({ success: false, error: 'Không thể hủy đơn hàng đã xử lý' });
    }

    // Xóa order item
    await db.query('DELETE FROM orderitems WHERE OrderItemId = ?', [orderItemId]);

    // Kiểm tra còn order item trong order không
    const remainingItems = await db.query('SELECT OrderItemId FROM orderitems WHERE OrderId = ?', [OrderId]);
    if (remainingItems.length === 0) {
      // Xóa bản ghi trong payment trước
      await db.query('DELETE FROM payment WHERE orderid = ?', [OrderId]);
      // Sau đó xóa order
      await db.query('DELETE FROM orders WHERE OrderId = ?', [OrderId]);
      // Xóa khỏi giỏ hàng
      await db.query('DELETE FROM cart WHERE UserId = ? AND ProductId = ?', [userId, ProductId]);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('❌ Lỗi khi xóa order item:', err.message || err);
    return res.status(500).json({ success: false, error: err.message || 'Lỗi server' });
  }
});



app.listen(3000, '0.0.0.0', () => {
  console.log('Server is running on 0.0.0.0:3000');
});


