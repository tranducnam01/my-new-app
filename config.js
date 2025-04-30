// auto-config.js
const fs = require('fs');
const os = require('os');
const path = require('path');

const interfaces = os.networkInterfaces();
let localIP = null;

for (const name of Object.keys(interfaces)) {
  for (const net of interfaces[name]) {
    if (net.family === 'IPv4' && !net.internal) {
      localIP = net.address;
      break;
    }
  }
  if (localIP) break;
}

if (!localIP) {
  console.error("❌ Không tìm thấy địa chỉ IP phù hợp.");
  process.exit(1);
}

const baseURL = `http://${localIP}:3000`;
const configContent = `// config.js\nexport const BASE_URL = '${baseURL}';\n`;

// ✅ Ghi file config.js ở cùng cấp auto-config.js
const configPath = path.join(__dirname, 'src', 'Utils', 'config.js');

fs.writeFileSync(configPath, configContent);
console.log(`✅ Đã tạo hoặc cập nhật config.js tại: ${configPath}`);
