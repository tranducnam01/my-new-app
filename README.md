# Welcome to your Expo app .
# e-commerce application

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.


## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
📸 Hình minh họa sau khi chạy code

**Giao diện đăng nhập**
<img width="234" height="505" alt="image" src="https://github.com/user-attachments/assets/767a6695-b98a-4c7e-9cd0-a9b321e9bdde" />

---

**Giao diện trang chủ** 
<img width="237" height="692" alt="image" src="https://github.com/user-attachments/assets/ef662309-009f-4b2b-a14c-cd4ef71ff4bd" />

---

**Giao diện sản phẩm**
<img width="242" height="507" alt="image" src="https://github.com/user-attachments/assets/13eddf4f-3d82-467f-b539-ff9a86bb1c43" />

---


Ứng dụng **mobile** được phát triển bằng **React Native (Expo)** kết hợp với **Node.js + MySQL** làm backend.  
Mục tiêu: xây dựng app với tính năng **đăng nhập tài khoản khách hàng,đăng ký tài khoản khách hàng , giỏ hàng, mua sản phẩm , đặt hàng , thanh toán online**.

---

## 🚀 Tính năng chính
- Đăng ký / đăng nhập người dùng
- Gửi dữ liệu từ app → server Node.js
- Server lưu trữ dữ liệu trong **MySQL**
- Upload ảnh / file (nếu có)
- Hiển thị thông tin từ database ra app
- Mã hóa thông tin người dùng
- Tích hợp thanh toán online

---

## 🛠️ Công nghệ sử dụng
- **Frontend**: React Native (Expo)
- **Backend**: Node.js + Express
- **Database**: MySQL
- **IDE gợi ý**: Visual Studio Code
- **API**: RESTful API để giao tiếp giữa app và server

---

## 📦 Cài đặt & chạy

### 1. Clone project
```bash
git clone https://github.com/tranducnam01/my-new-app.git
cd my-new-app
```
### 2. Cài đặt và chạy server

## Vào thư mục server/ (hoặc nơi chứa file Server.js).

## Cài dependencies:
```bash
npm install
```
## Chỉnh cấu hình MySQL trong tạo 1 file 
```
bash Server.js
```
```bash
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',        // user MySQL
  password: '',        // mật khẩu MySQL
  database: 'myappdb'  // tên database
});
```
## Chạy server:
```bash
node Server.js
```
## Mặc định server chạy tại:
```bash
http://localhost:3000
```
### 3. Cài đặt và chạy mobile app
Quay lại thư mục chính
```bash
cd ..
npm install
```
Start ứng dụng:
```bash
npm start
```
Mở app bằng Expo Go trên điện thoại, quét QR code từ terminal hoặc trình duyệt.

⚠️ Lưu ý: Nếu chạy trên thiết bị thật, thay localhost bằng IP LAN của máy trong file gọi API.
```bash
const API_URL = "http://192.168.1.10:3000/api";
```


