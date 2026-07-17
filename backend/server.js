const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// ==================== IN-MEMORY DATABASE ====================

// Cấu hình số lượng slot ban đầu
let slots = {
  xang: [
    { id: 'X01', status: 'Occupied', vehiclePlate: '30A-99999', checkInTime: new Date(Date.now() - 3.5 * 3600000) },
    { id: 'X02', status: 'Available', vehiclePlate: null, checkInTime: null },
    { id: 'X03', status: 'Available', vehiclePlate: null, checkInTime: null },
    { id: 'X04', status: 'Available', vehiclePlate: null, checkInTime: null },
    { id: 'X05', status: 'Available', vehiclePlate: null, checkInTime: null },
    { id: 'X06', status: 'Available', vehiclePlate: null, checkInTime: null },
    { id: 'X07', status: 'Available', vehiclePlate: null, checkInTime: null },
    { id: 'X08', status: 'Available', vehiclePlate: null, checkInTime: null },
  ],
  dien: [
    { id: 'D01', status: 'Occupied', vehiclePlate: '29A-88888', checkInTime: new Date(Date.now() - 2 * 3600000), charging: true },
    { id: 'D02', status: 'Pending', vehiclePlate: '30E-11111', checkInTime: new Date(Date.now() - 1 * 3600000), charging: false },
    { id: 'D03', status: 'Available', vehiclePlate: null, checkInTime: null, charging: false },
    { id: 'D04', status: 'Available', vehiclePlate: null, checkInTime: null, charging: false },
    { id: 'D05', status: 'Available', vehiclePlate: null, checkInTime: null, charging: false },
    { id: 'D06', status: 'Available', vehiclePlate: null, checkInTime: null, charging: false },
  ]
};

// Cấu hình giá vé mặc định
let pricingConfig = {
  xangPerHour: 10000,
  dienPerHour: 10000,
  dienChargingPerKwh: 3000
};

// Danh sách nhân viên
let staffAccounts = [
  { username: 'admin', password: '123', role: 'admin', name: 'Quản Trị Viên Hệ Thống' },
  { username: 'staff1', password: '123', role: 'staff', name: 'Nguyễn Văn Hùng' },
  { username: 'staff2', password: '123', role: 'staff', name: 'Lê Thị Thuỷ' }
];

// Danh sách khách hàng (Dành cho Mobile App)
let customerAccounts = [
  { username: 'khach1', password: '123', name: 'Lê Văn Cường', phone: '0987654321', licensePlate: '30A-99999' },
  { username: 'khach2', password: '123', name: 'Phạm Văn Dũng', phone: '0912345678', licensePlate: '29A-88888' }
];

// Danh sách thẻ tháng
let monthlyCards = [
  { cardNumber: 'MC000001', ownerName: 'Trần Minh Hải', licensePlate: '30A-99999', phone: '0981234567', expiryDate: '2026-12-31', type: 'xang' },
  { cardNumber: 'MC000002', ownerName: 'Nguyễn Quốc Bảo', licensePlate: '29A-88888', phone: '0978888888', expiryDate: '2026-08-15', type: 'dien' }
];

// Lịch sử phiên đỗ xe (Chứa cả phiên hiện tại và phiên đã hoàn thành để làm báo cáo thống kê)
let parkingSessions = [
  // Session hiện tại cho X01
  {
    id: 'session-x01',
    licensePlate: '30A-99999',
    vehicleType: 'xang',
    slotId: 'X01',
    checkInTime: new Date(Date.now() - 3.5 * 3600000),
    checkOutTime: null,
    status: 'Parking',
    amount: 0,
    chargingUsed: 0,
    isMonthlyCard: true,
    facePhoto: ''
  },
  // Session hiện tại cho D01
  {
    id: 'session-d01',
    licensePlate: '29A-88888',
    vehicleType: 'dien',
    slotId: 'D01',
    checkInTime: new Date(Date.now() - 2 * 3600000),
    checkOutTime: null,
    status: 'Parking',
    amount: 0,
    chargingUsed: 12.5, // kWh sạc phát sinh
    isMonthlyCard: true,
    facePhoto: ''
  },
  // Session hiện tại cho D02 (đang chờ thanh toán)
  {
    id: 'session-d02',
    licensePlate: '30E-11111',
    vehicleType: 'dien',
    slotId: 'D02',
    checkInTime: new Date(Date.now() - 1 * 3600000),
    checkOutTime: null,
    status: 'PendingPayment',
    amount: 25000,
    chargingUsed: 5,
    isMonthlyCard: false,
    facePhoto: ''
  },
  // Dữ liệu mẫu lịch sử đỗ xe trong 7 ngày gần nhất để làm biểu đồ báo cáo doanh thu
  { id: 's-old-1', licensePlate: '30A-00001', vehicleType: 'xang', slotId: 'X02', checkInTime: new Date(Date.now() - 6 * 24 * 3600000 - 3 * 3600000), checkOutTime: new Date(Date.now() - 6 * 24 * 3600000), status: 'CheckedOut', amount: 30000, chargingUsed: 0, isMonthlyCard: false },
  { id: 's-old-2', licensePlate: '30A-00002', vehicleType: 'xang', slotId: 'X03', checkInTime: new Date(Date.now() - 5 * 24 * 3600000 - 2 * 3600000), checkOutTime: new Date(Date.now() - 5 * 24 * 3600000), status: 'CheckedOut', amount: 20000, chargingUsed: 0, isMonthlyCard: false },
  { id: 's-old-3', licensePlate: '29D-11111', vehicleType: 'dien', slotId: 'D03', checkInTime: new Date(Date.now() - 5 * 24 * 3600000 - 4 * 3600000), checkOutTime: new Date(Date.now() - 5 * 24 * 3600000), status: 'CheckedOut', amount: 85000, chargingUsed: 15, isMonthlyCard: false },
  { id: 's-old-4', licensePlate: '30E-22222', vehicleType: 'dien', slotId: 'D04', checkInTime: new Date(Date.now() - 4 * 24 * 3600000 - 1.5 * 3600000), checkOutTime: new Date(Date.now() - 4 * 24 * 3600000), status: 'CheckedOut', amount: 45000, chargingUsed: 10, isMonthlyCard: false },
  { id: 's-old-5', licensePlate: '17B-33333', vehicleType: 'xang', slotId: 'X04', checkInTime: new Date(Date.now() - 3 * 24 * 3600000 - 5 * 3600000), checkOutTime: new Date(Date.now() - 3 * 24 * 3600000), status: 'CheckedOut', amount: 50000, chargingUsed: 0, isMonthlyCard: false },
  { id: 's-old-6', licensePlate: '30A-44444', vehicleType: 'xang', slotId: 'X05', checkInTime: new Date(Date.now() - 2 * 24 * 3600000 - 2 * 3600000), checkOutTime: new Date(Date.now() - 2 * 24 * 3600000), status: 'CheckedOut', amount: 20000, chargingUsed: 0, isMonthlyCard: false },
  { id: 's-old-7', licensePlate: '29C-55555', vehicleType: 'dien', slotId: 'D05', checkInTime: new Date(Date.now() - 1 * 24 * 3600000 - 3 * 3600000), checkOutTime: new Date(Date.now() - 1 * 24 * 3600000), status: 'CheckedOut', amount: 90000, chargingUsed: 20, isMonthlyCard: false },
  { id: 's-old-8', licensePlate: '30H-66666', vehicleType: 'xang', slotId: 'X06', checkInTime: new Date(Date.now() - 4 * 3600000), checkOutTime: new Date(), status: 'CheckedOut', amount: 40000, chargingUsed: 0, isMonthlyCard: false }
];

// Ghi nhận QR thanh toán tương ứng cho các session
let pendingQRs = {};

// ==================== REST APIS ====================

// Trang chủ báo trạng thái hoạt động
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Smart Parking Backend Status</title>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', -apple-system, sans-serif; background: #f8f9fa; color: #333; margin: 0; padding: 40px; display: flex; justify-content: center; align-items: center; height: 100vh; box-sizing: border-box; }
          .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); text-align: center; max-width: 500px; width: 100%; }
          h1 { color: #1a73e8; margin-bottom: 10px; font-size: 28px; }
          p { color: #5f6368; font-size: 15px; line-height: 1.5; margin-bottom: 25px; }
          .badge { display: inline-block; padding: 6px 12px; background: #e6f4ea; color: #137333; font-weight: bold; border-radius: 20px; font-size: 13px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(40,167,69,0.1); }
          .list { text-align: left; background: #f1f3f4; padding: 15px 20px; border-radius: 8px; font-family: monospace; font-size: 13px; color: #3c4043; line-height: 1.6; }
          .list a { color: #1a73e8; text-decoration: none; font-weight: bold; }
          .list a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">● Server Đang Hoạt Động</div>
          <h1>Smart Parking Backend</h1>
          <p>Chào mừng bạn đến với hệ thống backend quản lý bãi đỗ xe thông minh. Máy chủ đang chạy thành công trên cổng 5000 và đã sẵn sàng nhận kết nối Socket.io.</p>
          <div class="list">
            Các API thử nghiệm trực tiếp:<br/>
            - Sơ đồ bãi xe: <a href="/api/slots" target="_blank">/api/slots</a><br/>
            - Cấu hình bảng giá: <a href="/api/pricing" target="_blank">/api/pricing</a><br/>
            - Thống kê & Báo cáo: <a href="/api/reports" target="_blank">/api/reports</a><br/>
            - Danh sách thẻ tháng: <a href="/api/monthly-cards" target="_blank">/api/monthly-cards</a>
          </div>
        </div>
      </body>
    </html>
  `);
});


// UC001: Đăng nhập
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = staffAccounts.find(u => u.username === username && u.password === password);
  if (user) {
    return res.json({
      success: true,
      user: {
        username: user.username,
        role: user.role,
        name: user.name
      }
    });
  }
  return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
});

// Đăng nhập cho Khách hàng trên Mobile
app.post('/api/customer/login', (req, res) => {
  const { username, password } = req.body;
  const user = customerAccounts.find(u => u.username === username && u.password === password);
  if (user) {
    return res.json({
      success: true,
      user: {
        username: user.username,
        name: user.name,
        phone: user.phone,
        licensePlate: user.licensePlate
      }
    });
  }
  return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
});

// Đăng ký cho Khách hàng trên Mobile
app.post('/api/customer/register', (req, res) => {
  const { username, password, name, phone, licensePlate } = req.body;
  if (!username || !password || !name || !phone || !licensePlate) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin đăng ký.' });
  }

  if (customerAccounts.some(u => u.username === username)) {
    return res.status(400).json({ success: false, message: 'Tên đăng nhập đã tồn tại.' });
  }

  const cleanPlate = licensePlate.trim().toUpperCase();
  const newUser = {
    username,
    password,
    name,
    phone,
    licensePlate: cleanPlate
  };

  customerAccounts.push(newUser);
  return res.json({
    success: true,
    message: 'Đăng ký tài khoản thành công.',
    user: {
      username: newUser.username,
      name: newUser.name,
      phone: newUser.phone,
      licensePlate: newUser.licensePlate
    }
  });
});


// UC002: Đăng ký thẻ tháng
app.post('/api/monthly-cards', (req, res) => {
  const { ownerName, licensePlate, phone, type } = req.body;
  if (!ownerName || !licensePlate || !phone || !type) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin đăng ký thẻ tháng.' });
  }
  const cardNumber = 'MC' + Math.floor(100000 + Math.random() * 900000);
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 tháng hạn dùng

  const newCard = {
    cardNumber,
    ownerName,
    licensePlate,
    phone,
    expiryDate: expiryDate.toISOString().split('T')[0],
    type
  };
  monthlyCards.push(newCard);
  return res.json({ success: true, card: newCard, message: 'Đăng ký thẻ tháng thành công.' });
});

app.get('/api/monthly-cards', (req, res) => {
  res.json(monthlyCards);
});

// UC003: Check-in xe
app.post('/api/check-in', (req, res) => {
  const { licensePlate, vehicleType, facePhoto } = req.body;
  if (!licensePlate || !vehicleType) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp biển số và loại xe.' });
  }

  const type = vehicleType === 'dien' ? 'dien' : 'xang';
  
  // Kiểm tra xem xe này có đang ở trong bãi không
  const activeSession = parkingSessions.find(s => s.licensePlate === licensePlate && (s.status === 'Parking' || s.status === 'PendingPayment'));
  if (activeSession) {
    return res.status(400).json({ success: false, message: 'Xe này hiện tại đã check-in và đang ở trong bãi.' });
  }

  // Tìm slot trống đầu tiên
  const slotList = slots[type];
  const freeSlot = slotList.find(s => s.status === 'Available');

  if (!freeSlot) {
    return res.status(400).json({ success: false, message: `Bãi xe khu vực ${type === 'dien' ? 'Xe Điện' : 'Xe Xăng'} đã hết chỗ.` });
  }

  // Cập nhật trạng thái slot
  freeSlot.status = 'Occupied';
  freeSlot.vehiclePlate = licensePlate;
  freeSlot.checkInTime = new Date();

  // Kiểm tra thẻ tháng
  const hasCard = monthlyCards.find(c => c.licensePlate === licensePlate && new Date(c.expiryDate) >= new Date());

  const sessionId = uuidv4();
  const newSession = {
    id: sessionId,
    licensePlate,
    vehicleType: type,
    slotId: freeSlot.id,
    checkInTime: new Date(),
    checkOutTime: null,
    status: 'Parking',
    amount: 0,
    chargingUsed: 0,
    isMonthlyCard: !!hasCard,
    facePhoto: facePhoto || ''
  };

  parkingSessions.push(newSession);

  // Phát tín hiệu cập nhật bãi đỗ
  io.emit('slot_update', slots);

  return res.json({
    success: true,
    message: `Đã xếp xe vào slot ${freeSlot.id}. Trạng thái: ${hasCard ? 'Thẻ tháng' : 'Vé lượt'}.`,
    session: newSession
  });
});

// UC004: Check-out xe và tính toán chi phí (tạo QR động)
app.post('/api/check-out/request', async (req, res) => {
  const { licensePlate } = req.body;
  if (!licensePlate) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp biển số xe.' });
  }

  const session = parkingSessions.find(s => s.licensePlate === licensePlate && s.status === 'Parking');
  if (!session) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy phiên đỗ xe hoạt động cho biển số này.' });
  }

  const checkOutTime = new Date();
  const durationMs = checkOutTime - new Date(session.checkInTime);
  const durationHours = Math.max(1, Math.ceil(durationMs / 3600000)); // Tối thiểu tính 1 giờ

  let amount = 0;
  let detail = '';

  if (session.isMonthlyCard) {
    amount = 0;
    detail = 'Xe thẻ tháng (Miễn phí lượt đỗ)';
  } else {
    if (session.vehicleType === 'xang') {
      amount = durationHours * pricingConfig.xangPerHour;
      detail = `${durationHours} giờ đỗ x ${pricingConfig.xangPerHour.toLocaleString()}đ/giờ`;
    } else {
      // Xe điện: Phí đỗ + Phí sạc (Giả lập sạc ngẫu nhiên từ 5 đến 20 kWh nếu đỗ lâu hơn 1h)
      const chargeUsed = durationHours > 1 ? Math.floor(5 + Math.random() * 15) : 0;
      session.chargingUsed = chargeUsed;
      const parkingFee = durationHours * pricingConfig.dienPerHour;
      const chargingFee = chargeUsed * pricingConfig.dienChargingPerKwh;
      amount = parkingFee + chargingFee;
      detail = `${durationHours} giờ đỗ (${parkingFee.toLocaleString()}đ) + ${chargeUsed}kWh sạc (${chargingFee.toLocaleString()}đ)`;
    }
  }

  session.checkOutTime = checkOutTime;
  session.amount = amount;

  if (amount > 0) {
    // Đổi trạng thái sang Chờ thanh toán và slot sang Pending (Màu vàng)
    session.status = 'PendingPayment';
    const slotList = slots[session.vehicleType];
    const slot = slotList.find(s => s.id === session.slotId);
    if (slot) {
      slot.status = 'Pending';
    }

    // Tạo mã QR thanh toán động
    const paymentContent = `THANHTOAN_${session.id.substring(0, 8)}`;
    const qrText = `STK: 0987654321 - MB Bank | So Tien: ${amount} VND | Noi dung: ${paymentContent}`;
    
    let qrCodeBase64 = "";
    try {
      qrCodeBase64 = await QRCode.toDataURL(qrText);
    } catch (err) {
      console.log("Không tạo được QR base64 nội bộ, chuyển sang dùng QR API ngoài...");
      qrCodeBase64 = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrText)}`;
    }
    
    pendingQRs[session.id] = qrCodeBase64;

    io.emit('slot_update', slots);
    io.emit('payment_pending', {
      sessionId: session.id,
      licensePlate: session.licensePlate,
      amount,
      detail,
      qrCode: qrCodeBase64
    });

    return res.json({
      success: true,
      session,
      qrCode: qrCodeBase64,
      amount,
      detail,
      message: 'Yêu cầu thanh toán đã được tạo. Vui lòng quét mã QR trên thiết bị khách hàng.'
    });

  } else {
    // Không mất phí (Thẻ tháng) - Cho xe ra ngay lập tức
    session.status = 'CheckedOut';
    const slotList = slots[session.vehicleType];
    const slot = slotList.find(s => s.id === session.slotId);
    if (slot) {
      slot.status = 'Available';
      slot.vehiclePlate = null;
      slot.checkInTime = null;
    }

    io.emit('slot_update', slots);
    io.emit('payment_success', { sessionId: session.id, licensePlate: session.licensePlate, message: 'Đã check-out thành công (Xe thẻ tháng).' });

    return res.json({
      success: true,
      session,
      amount: 0,
      detail: 'Thẻ tháng hợp lệ, barrier tự động mở.',
      message: 'Xe thẻ tháng ra bãi thành công.'
    });
  }
});

// Xác nhận thanh toán (Confirm payment qua API hoặc Staff thao tác khẩn cấp)
app.post('/api/payment/confirm', (req, res) => {
  const { sessionId } = req.body;
  const session = parkingSessions.find(s => s.id === sessionId);
  if (!session) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy phiên giao dịch.' });
  }

  if (session.status !== 'PendingPayment') {
    return res.status(400).json({ success: false, message: 'Phiên đỗ xe không ở trạng thái chờ thanh toán.' });
  }

  // Cập nhật trạng thái
  session.status = 'CheckedOut';
  session.checkOutTime = session.checkOutTime || new Date();
  
  // Giải phóng slot
  const slotList = slots[session.vehicleType];
  const slot = slotList.find(s => s.id === session.slotId);
  if (slot) {
    slot.status = 'Available';
    slot.vehiclePlate = null;
    slot.checkInTime = null;
    if (slot.charging !== undefined) {
      slot.charging = false;
    }
  }

  // Phát tín hiệu realtime mở barrier
  io.emit('payment_success', {
    sessionId: session.id,
    licensePlate: session.licensePlate,
    amount: session.amount,
    message: 'Thanh toán thành công. Barrier đang mở!'
  });

  io.emit('slot_update', slots);

  return res.json({ success: true, message: 'Thanh toán được xác nhận thành công.' });
});

// Xử lý thủ công bằng nút bấm nếu nhận diện khuôn mặt lỗi (Handle Manual Review)
app.post('/api/payment/manual-review', (req, res) => {
  const { sessionId } = req.body;
  const session = parkingSessions.find(s => s.id === sessionId);
  if (!session) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy phiên giao dịch.' });
  }

  // Đóng vai trò giải phóng xe khẩn cấp bypass thanh toán hoặc xác nhận thu tiền mặt trực tiếp
  session.status = 'CheckedOut';
  session.checkOutTime = session.checkOutTime || new Date();

  const slotList = slots[session.vehicleType];
  const slot = slotList.find(s => s.id === session.slotId);
  if (slot) {
    slot.status = 'Available';
    slot.vehiclePlate = null;
    slot.checkInTime = null;
    if (slot.charging !== undefined) {
      slot.charging = false;
    }
  }

  // Phát tín hiệu mở barrier
  io.emit('payment_success', {
    sessionId: session.id,
    licensePlate: session.licensePlate,
    amount: session.amount,
    message: 'Xác nhận mở barrier thủ công bởi nhân viên.'
  });

  io.emit('slot_update', slots);

  return res.json({ success: true, message: 'Mở barrier thủ công thành công.' });
});

// UC005: Cấu hình slots
app.get('/api/slots', (req, res) => {
  res.json(slots);
});

app.post('/api/slots/configure', (req, res) => {
  const { countXang, countDien } = req.body;
  if (!countXang || !countDien) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp số lượng slot xăng và điện.' });
  }

  // Xăng
  const currentXang = slots.xang.length;
  if (countXang > currentXang) {
    for (let i = currentXang + 1; i <= countXang; i++) {
      slots.xang.push({ id: `X${i < 10 ? '0' + i : i}`, status: 'Available', vehiclePlate: null, checkInTime: null });
    }
  } else if (countXang < currentXang) {
    // Chỉ xoá các slot trống
    let deleted = 0;
    let target = currentXang - countXang;
    for (let i = slots.xang.length - 1; i >= 0; i--) {
      if (slots.xang[i].status === 'Available' && deleted < target) {
        slots.xang.splice(i, 1);
        deleted++;
      }
    }
  }

  // Điện
  const currentDien = slots.dien.length;
  if (countDien > currentDien) {
    for (let i = currentDien + 1; i <= countDien; i++) {
      slots.dien.push({ id: `D${i < 10 ? '0' + i : i}`, status: 'Available', vehiclePlate: null, checkInTime: null, charging: false });
    }
  } else if (countDien < currentDien) {
    let deleted = 0;
    let target = currentDien - countDien;
    for (let i = slots.dien.length - 1; i >= 0; i--) {
      if (slots.dien[i].status === 'Available' && deleted < target) {
        slots.dien.splice(i, 1);
        deleted++;
      }
    }
  }

  io.emit('slot_update', slots);
  return res.json({ success: true, slots, message: 'Cập nhật cấu hình slot bãi đỗ thành công.' });
});

// UC006: Quản lý staff
app.get('/api/staff', (req, res) => {
  res.json(staffAccounts.map(s => ({ username: s.username, name: s.name, role: s.role })));
});

app.post('/api/staff', (req, res) => {
  const { username, password, role, name } = req.body;
  if (!username || !password || !role || !name) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin nhân viên.' });
  }

  if (staffAccounts.some(s => s.username === username)) {
    return res.status(400).json({ success: false, message: 'Tên đăng nhập đã tồn tại.' });
  }

  staffAccounts.push({ username, password, role, name });
  return res.json({ success: true, message: 'Thêm nhân viên mới thành công.' });
});

app.delete('/api/staff/:username', (req, res) => {
  const { username } = req.params;
  if (username === 'admin') {
    return res.status(400).json({ success: false, message: 'Không thể xoá tài khoản admin tối cao.' });
  }
  const index = staffAccounts.findIndex(s => s.username === username);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên.' });
  }
  staffAccounts.splice(index, 1);
  return res.json({ success: true, message: 'Đã xoá tài khoản nhân viên.' });
});

// UC007: Cấu hình giá
app.get('/api/pricing', (req, res) => {
  res.json(pricingConfig);
});

app.post('/api/pricing', (req, res) => {
  const { xangPerHour, dienPerHour, dienChargingPerKwh } = req.body;
  if (xangPerHour === undefined || dienPerHour === undefined || dienChargingPerKwh === undefined) {
    return res.status(400).json({ success: false, message: 'Cấu hình giá không hợp lệ.' });
  }
  pricingConfig = {
    xangPerHour: Number(xangPerHour),
    dienPerHour: Number(dienPerHour),
    dienChargingPerKwh: Number(dienChargingPerKwh)
  };
  return res.json({ success: true, pricingConfig, message: 'Cập nhật bảng giá vé thành công.' });
});

// UC008: Thống kê doanh thu & báo cáo lưu lượng xe
app.get('/api/reports', (req, res) => {
  // Doanh thu theo loại xe
  const completed = parkingSessions.filter(s => s.status === 'CheckedOut');
  
  let revenueXang = 0;
  let revenueDien = 0;
  let countXang = 0;
  let countDien = 0;

  completed.forEach(s => {
    if (s.vehicleType === 'xang') {
      revenueXang += s.amount;
      countXang++;
    } else {
      revenueDien += s.amount;
      countDien++;
    }
  });

  // Doanh thu theo 7 ngày gần nhất
  const dailyData = {};
  for (let i = 6; i >= 0; i--) {
    const dateStr = new Date(Date.now() - i * 24 * 3600000).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    dailyData[dateStr] = { revenue: 0, count: 0 };
  }

  completed.forEach(s => {
    if (s.checkOutTime) {
      const dateStr = new Date(s.checkOutTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      if (dailyData[dateStr]) {
        dailyData[dateStr].revenue += s.amount;
        dailyData[dateStr].count += 1;
      }
    }
  });

  const dailyReport = Object.keys(dailyData).map(date => ({
    date,
    revenue: dailyData[date].revenue,
    count: dailyData[date].count
  }));

  // Tỉ lệ trống bãi đỗ hiện tại
  const freeXang = slots.xang.filter(s => s.status === 'Available').length;
  const occupiedXang = slots.xang.length - freeXang;
  const freeDien = slots.dien.filter(s => s.status === 'Available').length;
  const occupiedDien = slots.dien.length - freeDien;

  res.json({
    totalRevenue: revenueXang + revenueDien,
    revenueXang,
    revenueDien,
    countXang,
    countDien,
    dailyReport,
    occupancy: {
      xang: { total: slots.xang.length, occupied: occupiedXang, free: freeXang },
      dien: { total: slots.dien.length, occupied: occupiedDien, free: freeDien }
    }
  });
});

// Tìm kiếm phiên đỗ xe hiện tại bằng biển số (Dành cho Mobile App)
app.get('/api/sessions/active/:licensePlate', (req, res) => {
  const { licensePlate } = req.params;
  const cleanPlate = licensePlate.trim().toUpperCase();
  const session = parkingSessions.find(s => s.licensePlate === cleanPlate && (s.status === 'Parking' || s.status === 'PendingPayment'));
  if (!session) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy phiên đỗ xe nào của biển số này đang trong bãi.' });
  }
  
  // Tính tiền tạm tính nếu ở trạng thái Parking
  let amount = session.amount;
  let detail = '';
  if (session.status === 'Parking') {
    const durationMs = new Date() - new Date(session.checkInTime);
    const durationHours = Math.max(1, Math.ceil(durationMs / 3600000));
    
    if (session.isMonthlyCard) {
      amount = 0;
      detail = 'Xe thẻ tháng (Miễn phí)';
    } else {
      if (session.vehicleType === 'xang') {
        amount = durationHours * pricingConfig.xangPerHour;
        detail = `${durationHours} giờ đỗ x ${pricingConfig.xangPerHour.toLocaleString()}đ/giờ`;
      } else {
        const mockCharging = 5 + Math.floor(Math.random() * 10); // Giả lập sạc
        const parkingFee = durationHours * pricingConfig.dienPerHour;
        const chargingFee = mockCharging * pricingConfig.dienChargingPerKwh;
        amount = parkingFee + chargingFee;
        detail = `${durationHours} giờ đỗ (${parkingFee.toLocaleString()}đ) + ${mockCharging}kWh sạc (${chargingFee.toLocaleString()}đ)`;
      }
    }
  } else {
    // Nếu đang PendingPayment, lấy thông tin chi tiết đã tạo trước đó
    if (session.isMonthlyCard) {
      detail = 'Xe thẻ tháng (Miễn phí)';
    } else {
      const durationMs = new Date(session.checkOutTime) - new Date(session.checkInTime);
      const durationHours = Math.max(1, Math.ceil(durationMs / 3600000));
      if (session.vehicleType === 'xang') {
        detail = `${durationHours} giờ đỗ x ${pricingConfig.xangPerHour.toLocaleString()}đ/giờ`;
      } else {
        const parkingFee = durationHours * pricingConfig.dienPerHour;
        const chargingFee = session.chargingUsed * pricingConfig.dienChargingPerKwh;
        detail = `${durationHours} giờ đỗ (${parkingFee.toLocaleString()}đ) + ${session.chargingUsed}kWh sạc (${chargingFee.toLocaleString()}đ)`;
      }
    }
  }

  res.json({
    success: true,
    session: {
      ...session,
      amount,
      detail
    },
    qrCode: pendingQRs[session.id] || null
  });
});

// ==================== SOCKET.IO HANDLER ====================
io.on('connection', (socket) => {
  console.log(`Một kết nối socket mới được thiết lập: ${socket.id}`);

  // Lắng nghe sự kiện xác nhận thanh toán gửi từ Mobile App
  socket.on('payment_confirm', (data) => {
    const { sessionId } = data;
    console.log(`Nhận sự kiện payment_confirm từ Mobile cho session: ${sessionId}`);
    
    const session = parkingSessions.find(s => s.id === sessionId);
    if (session && session.status === 'PendingPayment') {
      session.status = 'CheckedOut';
      session.checkOutTime = session.checkOutTime || new Date();

      // Giải phóng slot
      const slotList = slots[session.vehicleType];
      const slot = slotList.find(s => s.id === session.slotId);
      if (slot) {
        slot.status = 'Available';
        slot.vehiclePlate = null;
        slot.checkInTime = null;
        if (slot.charging !== undefined) {
          slot.charging = false;
        }
      }

      // Xoá QR cache
      delete pendingQRs[sessionId];

      // Phát sự kiện thanh toán thành công về cho Web Staff để mở barrier
      io.emit('payment_success', {
        sessionId: session.id,
        licensePlate: session.licensePlate,
        amount: session.amount,
        message: 'Khách hàng thanh toán qua Mobile thành công. Barrier đang mở!'
      });

      // Cập nhật sơ đồ bãi đỗ realtime cho mọi client
      io.emit('slot_update', slots);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Kết nối socket đóng: ${socket.id}`);
  });
});

// Khởi chạy Server
const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
  const os = require('os');
  const nets = os.networkInterfaces();
  let lanIP = 'localhost';
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        lanIP = net.address;
        break;
      }
    }
  }
  console.log(`=======================================================`);
  console.log(`   BACKEND SMART PARKING ĐANG CHẠY TRÊN PORT ${PORT}`);
  console.log(`   Địa chỉ LAN:    http://${lanIP}:${PORT}`);
  console.log(`   Địa chỉ Local:  http://localhost:${PORT}`);
  console.log(`   Giả lập Android: http://10.0.2.2:${PORT}`);
  console.log(`=======================================================`);
});
