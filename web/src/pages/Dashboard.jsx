import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const BACKEND_URL = 'http://localhost:5000';

// Custom component render Lucide SVGs để độc lập hoàn toàn và chạy mượt mà
function Icon({ name, size = 20, color = 'currentColor', className = '' }) {
  const icons = {
    'layout-dashboard': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="10" rx="1" />
        <rect width="7" height="5" x="3" y="14" rx="1" />
      </svg>
    ),
    'map': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14.12 3.88 16 2v14l-6 4-6-4V4l6 4Z" />
        <path d="M16 2v14" />
        <path d="M10 8v14" />
      </svg>
    ),
    'zap': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    'door-closed': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M9 3v18" />
      </svg>
    ),
    'bar-chart-3': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 3v18h18" />
        <path d="M18 17V9" />
        <path d="M13 17V5" />
        <path d="M8 17v-3" />
      </svg>
    ),
    'sliders': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="4" x2="4" y1="21" y2="14" />
        <line x1="4" x2="4" y1="10" y2="3" />
        <line x1="12" x2="12" y1="21" y2="12" />
        <line x1="12" x2="12" y1="8" y2="3" />
        <line x1="20" x2="20" y1="21" y2="16" />
        <line x1="20" x2="20" y1="12" y2="3" />
        <line x1="2" x2="6" y1="14" y2="14" />
        <line x1="10" x2="14" y1="8" y2="8" />
        <line x1="18" x2="22" y1="16" y2="16" />
      </svg>
    ),
    'users': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    'power': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 2v10" />
        <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
      </svg>
    ),
    'clock': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    'car': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
        <path d="M13 17H9" />
      </svg>
    ),
    'lock': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    'user': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    'parking-square': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
      </svg>
    ),
    'pie-chart': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
      </svg>
    ),
    'arrow-down-right': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="7" y1="7" x2="17" y2="17" />
        <polyline points="17 7 17 17 7 17" />
      </svg>
    ),
    'arrow-up-right': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="7" y1="17" x2="17" y2="7" />
        <polyline points="7 7 17 7 17 17" />
      </svg>
    ),
    'plus-circle': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12h8" />
        <path d="M12 8v8" />
      </svg>
    ),
    'trash': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      </svg>
    )
  };
  return icons[name] || null;
}

export default function Dashboard() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ username: '', role: '', name: '' });
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Live Clock & Connection
  const [currentTime, setCurrentTime] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);

  // Parking State
  const [slots, setSlots] = useState({ xang: [], dien: [] });
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, sodo, checkin, checkout, monthly, config
  
  // Check-in Form State
  const [checkInPlate, setCheckInPlate] = useState('');
  const [checkInType, setCheckInType] = useState('xang');
  const [faceMockSelected, setFaceMockSelected] = useState('face1');
  const [checkInMessage, setCheckInMessage] = useState({ type: '', text: '' });

  // Check-out State
  const [checkOutPlate, setCheckOutPlate] = useState('');
  const [checkoutSession, setCheckoutSession] = useState(null);
  const [checkoutDetails, setCheckoutDetails] = useState(null);
  const [checkoutMessage, setCheckoutMessage] = useState({ type: '', text: '' });

  // Monthly Card Form State
  const [monthlyForm, setMonthlyForm] = useState({ ownerName: '', licensePlate: '', phone: '', type: 'xang' });
  const [monthlyCards, setMonthlyCards] = useState([]);
  const [monthlyMessage, setMonthlyMessage] = useState({ type: '', text: '' });

  // Reports State
  const [reportsData, setReportsData] = useState({
    totalRevenue: 0,
    revenueXang: 0,
    revenueDien: 0,
    countXang: 0,
    countDien: 0,
    dailyReport: [],
    occupancy: { xang: { total: 0, occupied: 0, free: 0 }, dien: { total: 0, occupied: 0, free: 0 } }
  });

  // Config State
  const [pricingConfig, setPricingConfig] = useState({ xangPerHour: 10000, dienPerHour: 10000, dienChargingPerKwh: 3000 });
  const [slotConfig, setSlotConfig] = useState({ countXang: 8, countDien: 6 });
  const [staffList, setStaffList] = useState([]);
  const [newStaffForm, setNewStaffForm] = useState({ username: '', password: '', role: 'staff', name: '' });
  const [configMessage, setConfigMessage] = useState({ type: '', text: '' });

  // Barrier Status UI State
  const [barrierState, setBarrierState] = useState('closed'); // closed, opening, open, closing
  const [lastPaymentNotification, setLastPaymentNotification] = useState(null);

  // Clock runner
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const dateStr = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      setCurrentTime(`${timeStr} - ${dateStr}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize socket and fetch initial data
  useEffect(() => {
    const savedUser = localStorage.getItem('parking_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setIsLoggedIn(true);
    }

    const socket = io(BACKEND_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    socket.on('slot_update', (updatedSlots) => {
      setSlots(updatedSlots);
    });

    socket.on('payment_pending', (data) => {
      setLastPaymentNotification({
        type: 'pending',
        title: 'Chờ thanh toán',
        message: `Xe ${data.licensePlate} yêu cầu check-out. Số tiền: ${data.amount.toLocaleString()}đ.`,
        time: new Date().toLocaleTimeString('vi-VN')
      });
      if (checkOutPlate === data.licensePlate) {
        fetchActiveSession(data.licensePlate);
      }
    });

    socket.on('payment_success', (data) => {
      setLastPaymentNotification({
        type: 'success',
        title: 'Thanh toán thành công',
        message: `Xe ${data.licensePlate} đã thanh toán ${data.amount ? data.amount.toLocaleString() + 'đ' : '0đ (Thẻ tháng)'}. Mở barrier!`,
        time: new Date().toLocaleTimeString('vi-VN')
      });
      
      triggerBarrierAnimation();
      fetchSlots();
      fetchReports();
      
      setCheckoutSession(null);
      setCheckoutDetails(null);
    });

    fetchSlots();

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchSlots();
      fetchReports();
      fetchPricing();
      fetchStaff();
      fetchMonthlyCards();
    }
  }, [isLoggedIn]);

  // Barrier Animation Logic
  const triggerBarrierAnimation = () => {
    setBarrierState('opening');
    setTimeout(() => {
      setBarrierState('open');
      setTimeout(() => {
        setBarrierState('closing');
        setTimeout(() => {
          setBarrierState('closed');
        }, 1500);
      }, 5000);
    }, 1500);
  };

  // REST API Calls
  const fetchSlots = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/slots`);
      const data = await res.json();
      setSlots(data);
      setSlotConfig({
        countXang: data.xang.length,
        countDien: data.dien.length
      });
    } catch (e) {
      console.error('Không thể lấy sơ đồ slot:', e);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/reports`);
      const data = await res.json();
      setReportsData(data);
    } catch (e) {
      console.error('Không thể lấy báo cáo:', e);
    }
  };

  const fetchPricing = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/pricing`);
      const data = await res.json();
      setPricingConfig(data);
    } catch (e) {
      console.error('Không thể lấy bảng giá:', e);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/staff`);
      const data = await res.json();
      setStaffList(data);
    } catch (e) {
      console.error('Không thể lấy danh sách nhân viên:', e);
    }
  };

  const fetchMonthlyCards = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/monthly-cards`);
      const data = await res.json();
      setMonthlyCards(data);
    } catch (e) {
      console.error('Không thể lấy danh sách thẻ tháng:', e);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setIsLoggedIn(true);
        localStorage.setItem('parking_user', JSON.stringify(data.user));
      } else {
        setLoginError(data.message || 'Lỗi đăng nhập.');
      }
    } catch (err) {
      setLoginError('Kết nối tới server thất bại.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('parking_user');
    setIsLoggedIn(false);
    setUser({ username: '', role: '', name: '' });
  };

  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    setCheckInMessage({ type: '', text: '' });
    if (!checkInPlate.trim()) {
      setCheckInMessage({ type: 'error', text: 'Vui lòng điền biển số xe!' });
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/api/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licensePlate: checkInPlate.trim().toUpperCase(),
          vehicleType: checkInType,
          facePhoto: faceMockSelected
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCheckInMessage({ type: 'success', text: data.message });
        setCheckInPlate('');
        fetchSlots();
      } else {
        setCheckInMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setCheckInMessage({ type: 'error', text: 'Không thể kết nối đến server.' });
    }
  };

  const fetchActiveSession = async (plate) => {
    if (!plate.trim()) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/sessions/active/${plate.trim().toUpperCase()}`);
      const data = await res.json();
      if (data.success) {
        setCheckoutSession(data.session);
        setCheckoutDetails({
          amount: data.session.amount,
          detail: data.session.detail,
          qrCode: data.qrCode
        });
      } else {
        setCheckoutSession(null);
        setCheckoutDetails(null);
        setCheckoutMessage({ type: 'error', text: data.message });
      }
    } catch (e) {
      setCheckoutMessage({ type: 'error', text: 'Lỗi tìm kiếm biển số.' });
    }
  };

  const handleCheckOutRequest = async (e) => {
    e.preventDefault();
    setCheckoutMessage({ type: '', text: '' });
    if (!checkOutPlate.trim()) {
      setCheckoutMessage({ type: 'error', text: 'Vui lòng cung cấp biển số xe!' });
      return;
    }
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/check-out/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licensePlate: checkOutPlate.trim().toUpperCase() })
      });
      const data = await res.json();
      if (res.ok) {
        setCheckoutSession(data.session);
        setCheckoutDetails({
          amount: data.amount,
          detail: data.detail,
          qrCode: data.qrCode
        });
        if (data.amount === 0) {
          setCheckoutMessage({ type: 'success', text: 'Xe thẻ tháng. Đã tự động mở Barrier.' });
        } else {
          setCheckoutMessage({ type: 'info', text: 'Đã tạo yêu cầu thanh toán. Vui lòng quét QR.' });
        }
        fetchSlots();
      } else {
        setCheckoutMessage({ type: 'error', text: data.message });
      }
    } catch (e) {
      setCheckoutMessage({ type: 'error', text: 'Lỗi kết nối server.' });
    }
  };

  const handleManualOpen = async () => {
    if (!checkoutSession) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/payment/manual-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: checkoutSession.id })
      });
      const data = await res.json();
      if (data.success) {
        setCheckoutMessage({ type: 'success', text: 'Đã xác nhận mở barrier khẩn cấp thủ công.' });
        setCheckoutSession(null);
        setCheckoutDetails(null);
        setCheckOutPlate('');
      } else {
        setCheckoutMessage({ type: 'error', text: data.message });
      }
    } catch (e) {
      setCheckoutMessage({ type: 'error', text: 'Lỗi gửi yêu cầu khẩn cấp.' });
    }
  };

  const handleMonthlySubmit = async (e) => {
    e.preventDefault();
    setMonthlyMessage({ type: '', text: '' });
    if (!monthlyForm.ownerName || !monthlyForm.licensePlate || !monthlyForm.phone) {
      setMonthlyMessage({ type: 'error', text: 'Vui lòng nhập đủ thông tin!' });
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/monthly-cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...monthlyForm,
          licensePlate: monthlyForm.licensePlate.trim().toUpperCase()
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMonthlyMessage({ type: 'success', text: `Đăng ký thành công! Số thẻ: ${data.card.cardNumber}` });
        setMonthlyForm({ ownerName: '', licensePlate: '', phone: '', type: 'xang' });
        fetchMonthlyCards();
      } else {
        setMonthlyMessage({ type: 'error', text: data.message });
      }
    } catch (e) {
      setMonthlyMessage({ type: 'error', text: 'Lỗi kết nối server.' });
    }
  };

  const handleSavePricing = async (e) => {
    e.preventDefault();
    setConfigMessage({ type: '', text: '' });
    try {
      const res = await fetch(`${BACKEND_URL}/api/pricing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricingConfig)
      });
      const data = await res.json();
      if (res.ok) {
        setConfigMessage({ type: 'success', text: 'Cập nhật bảng giá vé thành công.' });
      } else {
        setConfigMessage({ type: 'error', text: data.message });
      }
    } catch (e) {
      setConfigMessage({ type: 'error', text: 'Lỗi cập nhật giá vé.' });
    }
  };

  const handleSaveSlots = async (e) => {
    e.preventDefault();
    setConfigMessage({ type: '', text: '' });
    try {
      const res = await fetch(`${BACKEND_URL}/api/slots/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slotConfig)
      });
      const data = await res.json();
      if (res.ok) {
        setConfigMessage({ type: 'success', text: 'Cập nhật số lượng slot bãi đỗ thành công.' });
        fetchSlots();
      } else {
        setConfigMessage({ type: 'error', text: data.message });
      }
    } catch (e) {
      setConfigMessage({ type: 'error', text: 'Lỗi kết nối cập nhật slot.' });
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setConfigMessage({ type: '', text: '' });
    if (!newStaffForm.username || !newStaffForm.password || !newStaffForm.name) {
      setConfigMessage({ type: 'error', text: 'Vui lòng nhập đủ thông tin nhân viên!' });
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/api/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaffForm)
      });
      const data = await res.json();
      if (res.ok) {
        setConfigMessage({ type: 'success', text: 'Thêm nhân viên mới thành công.' });
        setNewStaffForm({ username: '', password: '', role: 'staff', name: '' });
        fetchStaff();
      } else {
        setConfigMessage({ type: 'error', text: data.message });
      }
    } catch (e) {
      setConfigMessage({ type: 'error', text: 'Lỗi kết nối thêm nhân viên.' });
    }
  };

  const handleDeleteStaff = async (username) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xoá tài khoản nhân viên ${username}?`)) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/staff/${username}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setConfigMessage({ type: 'success', text: 'Đã xoá tài khoản nhân viên.' });
        fetchStaff();
      } else {
        setConfigMessage({ type: 'error', text: data.message });
      }
    } catch (e) {
      setConfigMessage({ type: 'error', text: 'Lỗi kết nối xoá nhân viên.' });
    }
  };

  // Login Screen Render
  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <style dangerouslySetInnerHTML={{ __html: `
          @font-face {
            font-family: 'Google Sans Flex';
            src: url('/fonts/GoogleSansFlex.ttf') format('truetype');
            font-weight: 100 1000;
            font-style: normal;
          }
          body {
            margin: 0;
            padding: 0;
            background-color: #f0f4f9;
            font-family: 'Google Sans Flex', 'Outfit', 'Inter', -apple-system, sans-serif;
            color: #1e293b;
          }
          .login-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: radial-gradient(circle at 50% 20%, #e2e8f0 0%, #cbd5e1 70%);
          }
          .login-card {
            background-color: #ffffff;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
            border: 1px solid rgba(0,0,0,0.06);
            width: 100%;
            max-width: 420px;
            box-sizing: border-box;
          }
          .login-header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo-circle {
            width: 56px;
            height: 56px;
            border-radius: 14px;
            background-color: rgba(26, 115, 232, 0.08);
            color: #1a73e8;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px auto;
            box-shadow: 0 0 15px rgba(26, 115, 232, 0.1);
          }
          .login-header h2 {
            font-size: 24px;
            font-weight: 800;
            color: #1e293b;
            margin: 0 0 6px 0;
            letter-spacing: 1px;
          }
          .login-header p {
            color: #64748b;
            font-size: 13px;
            margin: 0;
            font-weight: 500;
          }
          .form-group {
            margin-bottom: 20px;
          }
          .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            font-size: 13px;
            color: #475569;
          }
          .input-with-icon {
            position: relative;
            display: flex;
            align-items: center;
          }
          .input-icon-svg {
            position: absolute;
            left: 12px;
            color: #94a3b8;
          }
          .form-group input {
            width: 100%;
            padding: 12px 12px 12px 40px;
            border: 1px solid #cbd5e1;
            border-radius: 10px;
            font-size: 14px;
            box-sizing: border-box;
            outline: none;
            color: #1e293b;
            background-color: #f8fafc;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .form-group input:focus {
            border-color: #1a73e8;
            background-color: #ffffff;
            box-shadow: 0 0 0 3px rgba(26,115,232,0.1);
          }
          .login-btn {
            width: 100%;
            padding: 14px;
            background-color: #1a73e8;
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 8px;
            margin-top: 25px;
            box-shadow: 0 4px 12px rgba(26,115,232,0.15);
          }
          .login-btn:hover {
            background-color: #1557b0;
            box-shadow: 0 6px 16px rgba(26,115,232,0.25);
            transform: translateY(-1px);
          }
          .error-msg {
            color: #d93025;
            background-color: #fdeded;
            border: 1px solid #fad2cf;
            padding: 12px;
            border-radius: 8px;
            font-size: 13px;
            margin-bottom: 20px;
            text-align: center;
            font-weight: 500;
          }
        ` }} />
        <div className="login-card">
          <div className="login-header">
            <div className="logo-circle">
              <Icon name="parking-square" size={28} />
            </div>
            <h2>NEXUS PARKING</h2>
            <p>Hệ thống Quản lý bãi đỗ xe thông minh</p>
          </div>
          {loginError && <div className="error-msg">{loginError}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <div className="input-with-icon">
                <div className="input-icon-svg"><Icon name="user" size={18} /></div>
                <input
                  type="text"
                  placeholder="admin / staff1"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <div className="input-with-icon">
                <div className="input-icon-svg"><Icon name="lock" size={18} /></div>
                <input
                  type="password"
                  placeholder="Mật khẩu (123)"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>
            </div>
            <button type="submit" className="login-btn">
              Đăng nhập
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard Screen Render
  const occupiedSlotsCount = slots.xang.filter(s => s.status !== 'Available').length + slots.dien.filter(s => s.status !== 'Available').length;
  const totalSlotsCount = slots.xang.length + slots.dien.length;
  const occupancyRate = totalSlotsCount > 0 ? Math.round((occupiedSlotsCount / totalSlotsCount) * 100) : 0;
  const activeEvChargers = slots.dien.filter(s => s.charging).length;

  return (
    <div className="dashboard-app">
      <style dangerouslySetInnerHTML={{ __html: `
        @font-face {
          font-family: 'Google Sans Flex';
          src: url('/fonts/GoogleSansFlex.ttf') format('truetype');
          font-weight: 100 1000;
          font-style: normal;
        }
        :root {
          --bg-main: #f8fafc;
          --bg-sidebar: #ffffff;
          --bg-panel: #ffffff;
          --border-color: rgba(0, 0, 0, 0.06);
          --border-glow: rgba(26, 115, 232, 0.1);
          
          --text-primary: #1e293b;
          --text-secondary: #64748b;
          --text-muted: #94a3b8;
          
          --accent-color: #1a73e8;
          --accent-glow: rgba(26, 115, 232, 0.15);
          
          --color-success: #28a745;
          --color-success-bg: rgba(40, 167, 69, 0.08);
          --color-warning: #ffc107;
          --color-warning-bg: rgba(255, 193, 7, 0.1);
          --color-error: #dc3545;
          --color-error-bg: rgba(220, 53, 69, 0.08);
          --color-info: #0088ff;
          --color-info-bg: rgba(0, 136, 255, 0.08);
          
          --font-main: 'Google Sans Flex', 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          --font-mono: 'Courier New', Courier, monospace;
          
          --transition-fast: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          --transition-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          
          --sidebar-width: 260px;
          --header-height: 80px;
        }

        body {
          margin: 0;
          padding: 0;
          font-family: var(--font-main);
          background-color: var(--bg-main);
          color: var(--text-primary);
        }
        .dashboard-app {
          display: flex;
          height: 100vh;
          overflow: hidden;
          background-color: var(--bg-main);
        }
        
        /* SIDEBAR */
        .sidebar {
          width: var(--sidebar-width);
          background-color: var(--bg-sidebar);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          z-index: 100;
        }
        .sidebar-brand {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid var(--border-color);
        }
        .brand-icon {
          color: var(--accent-color);
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 0 8px var(--accent-glow));
        }
        .brand-text h1 {
          font-size: 20px;
          font-weight: 800;
          margin: 0;
          letter-spacing: 1px;
          color: var(--text-primary);
        }
        .brand-text span {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 2px;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .sidebar-menu {
          list-style: none;
          padding: 24px 12px;
          margin: 0;
          flex-grow: 1;
        }
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          color: var(--text-secondary);
          border-radius: 10px;
          margin-bottom: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: var(--transition-fast);
          font-size: 14px;
        }
        .sidebar-item:hover {
          color: var(--text-primary);
          background-color: rgba(0, 0, 0, 0.03);
        }
        .sidebar-item.active {
          color: var(--accent-color);
          background: linear-gradient(90deg, rgba(26, 115, 232, 0.08) 0%, rgba(26, 115, 232, 0.01) 100%);
          box-shadow: inset 4px 0 0 0 var(--accent-color);
          font-weight: 600;
        }
        .sidebar-user {
          padding: 20px;
          border-top: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: #fafbfd;
        }
        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-color), #8000ff);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 12px;
          box-shadow: 0 0 8px rgba(26, 115, 232, 0.2);
        }
        .user-info {
          display: flex;
          flex-direction: column;
        }
        .user-info .name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .user-info .role {
          font-size: 10px;
          color: var(--text-secondary);
          text-transform: uppercase;
        }
        .logout-btn-nexus {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: var(--transition-fast);
        }
        .logout-btn-nexus:hover {
          color: var(--color-error);
          background-color: var(--color-error-bg);
        }

        /* MAIN CONTENT */
        .main-content {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          background-color: var(--bg-main);
        }
        .content-header {
          height: var(--header-height);
          background-color: #ffffff;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
        }
        .header-left h2 {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: var(--text-primary);
        }
        .header-left p {
          font-size: 12px;
          color: var(--text-secondary);
          margin: 0;
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .system-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          background-color: #f1f5f9;
          padding: 6px 12px;
          border-radius: 20px;
        }
        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .status-indicator.online { background-color: var(--color-success); box-shadow: 0 0 8px var(--color-success); }
        .status-indicator.offline { background-color: var(--color-error); box-shadow: 0 0 8px var(--color-error); }
        
        .live-clock {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-primary);
          font-weight: 600;
        }

        .content-body {
          padding: 32px;
          flex-grow: 1;
        }

        /* REALTIME NOTIFICATION TOAST */
        .notification-toast {
          background-color: #e8f0fe;
          border-left: 4px solid var(--accent-color);
          padding: 16px 20px;
          border-radius: 8px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 12px rgba(26,115,232,0.06);
          animation: slideDown 0.3s ease-out;
        }
        .notification-toast.success {
          background-color: #e6f4ea;
          border-left-color: var(--color-success);
        }
        .toast-title {
          font-weight: 700;
          font-size: 14px;
          color: #137333;
        }
        .toast-body {
          font-size: 13px;
          color: var(--text-primary);
          margin-top: 4px;
          font-weight: 500;
        }
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        /* KPI STATS GRID */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }
        .stat-card {
          background-color: var(--bg-panel);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
          position: relative;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.04);
        }
        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .stat-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .stat-icon-wrapper {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-icon-wrapper.blue { background-color: rgba(26,115,232,0.08); color: var(--accent-color); }
        .stat-icon-wrapper.green { background-color: rgba(40,167,69,0.08); color: var(--color-success); }
        .stat-icon-wrapper.orange { background-color: rgba(255,193,7,0.1); color: #d97706; }
        .stat-icon-wrapper.purple { background-color: rgba(128,0,255,0.08); color: #8000ff; }
        
        .stat-value-container {
          margin-bottom: 12px;
        }
        .stat-value {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-primary);
          display: block;
        }
        .stat-subtext {
          font-size: 11px;
          font-weight: 500;
          margin-top: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .text-success { color: var(--color-success); }
        .text-warning { color: #d97706; }
        .text-error { color: var(--color-error); }
        
        .progress-bar-container {
          background-color: #f1f5f9;
          height: 6px;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        .progress-bar-fill {
          height: 100%;
          border-radius: 10px;
        }
        .progress-bar-fill.blue { background-color: var(--accent-color); box-shadow: 0 0 6px var(--accent-glow); }
        .progress-bar-fill.green { background-color: var(--color-success); box-shadow: 0 0 6px rgba(40,167,69,0.3); }
        .progress-bar-fill.orange { background-color: #ff9800; }
        .progress-bar-fill.purple { background-color: #8000ff; }
        
        .stat-footer-metrics {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        /* BARRIER CONTROLLER */
        .barrier-container-nexus {
          background-color: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 4px 15px rgba(0,0,0,0.01);
        }
        .barrier-info h3 {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 6px 0;
        }
        .barrier-info p {
          font-size: 12px;
          color: var(--text-secondary);
          margin: 0;
          font-weight: 500;
        }
        .barrier-graphic-nexus {
          width: 140px;
          height: 80px;
          display: flex;
          align-items: flex-end;
          position: relative;
        }
        .barrier-post-nexus {
          width: 16px;
          height: 60px;
          background-color: #475569;
          border-radius: 4px 4px 0 0;
          position: relative;
          z-index: 2;
        }
        .barrier-gate-nexus {
          width: 110px;
          height: 8px;
          background: repeating-linear-gradient(45deg, #dc3545, #dc3545 10px, #ffffff 10px, #ffffff 20px);
          position: absolute;
          left: 8px;
          bottom: 40px;
          transform-origin: left center;
          transition: transform 1.2s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 4px;
          z-index: 1;
        }
        .barrier-gate-nexus.open {
          transform: rotate(-85deg);
        }
        .barrier-gate-nexus.closed {
          transform: rotate(0deg);
        }
        .barrier-badge {
          padding: 8px 16px;
          border-radius: 30px;
          font-weight: 700;
          font-size: 13px;
        }
        .barrier-badge.closed { background-color: var(--color-error-bg); color: var(--color-error); }
        .barrier-badge.open { background-color: var(--color-success-bg); color: var(--color-success); }
        .barrier-badge.moving { background-color: var(--color-warning-bg); color: #d97706; }

        /* GRID SYSTEM & NATIVE CARDS */
        .grid-2 {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 24px;
          align-items: stretch;
        }
        .grid-2.equal {
          grid-template-columns: 1fr 1fr;
          align-items: stretch;
        }
        .card {
          background-color: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.01);
          height: 100%;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }
        .card-header-nexus {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 20px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* PARKING PLOTS NATIVE GRID */
        .zone-container {
          margin-bottom: 30px;
        }
        .zone-header-nexus {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-secondary);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .slots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 16px;
        }
        .slot-card-nexus {
          border-radius: 12px;
          padding: 18px 16px;
          text-align: center;
          font-weight: 600;
          position: relative;
          box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        .slot-card-nexus:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.05);
        }
        
        .slot-card-nexus.Available {
          background-color: var(--color-success-bg);
          color: var(--color-success);
          border: 1px solid rgba(40, 167, 69, 0.15);
        }
        .slot-card-nexus.Occupied {
          background-color: var(--color-error-bg);
          color: var(--color-error);
          border: 1px solid rgba(220, 53, 69, 0.15);
        }
        .slot-card-nexus.Pending {
          background-color: var(--color-warning-bg);
          color: #d97706;
          border: 1px solid rgba(255, 193, 7, 0.2);
        }

        .slot-id-nexus {
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 6px;
        }
        .slot-status-lbl {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          opacity: 0.9;
        }
        .slot-plate-nexus {
          font-size: 11px;
          background-color: rgba(0, 0, 0, 0.04);
          padding: 3px 6px;
          border-radius: 6px;
          display: inline-block;
          margin-top: 8px;
          font-family: var(--font-mono);
          letter-spacing: 0.5px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .slot-charging-badge {
          font-size: 9px;
          font-weight: 700;
          color: #ffffff;
          background-color: var(--accent-color);
          border-radius: 4px;
          padding: 2px 6px;
          display: inline-block;
          margin-top: 6px;
          box-shadow: 0 2px 4px rgba(26,115,232,0.2);
        }

        /* FORMS CONTROL */
        .form-row {
          margin-bottom: 20px;
        }
        .form-row label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          font-size: 13px;
          color: var(--text-secondary);
        }
        .form-row input, .form-row select {
          width: 100%;
          padding: 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 14px;
          box-sizing: border-box;
          outline: none;
          background-color: #f8fafc;
          transition: all 0.2s;
        }
        .form-row input:focus, .form-row select:focus {
          border-color: var(--accent-color);
          background-color: #ffffff;
          box-shadow: 0 0 0 3px rgba(26,115,232,0.08);
        }
        .submit-btn-nexus {
          width: 100%;
          padding: 14px;
          background-color: var(--accent-color);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
        }
        .submit-btn-nexus:hover {
          background-color: #1557b0;
          transform: translateY(-1px);
        }
        
        .alert-box {
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 20px;
          font-weight: 500;
        }
        .alert-box.error { background-color: var(--color-error-bg); border: 1px solid rgba(220, 53, 69, 0.1); color: var(--color-error); }
        .alert-box.success { background-color: var(--color-success-bg); border: 1px solid rgba(40, 167, 69, 0.1); color: var(--color-success); }
        .alert-box.info { background-color: var(--color-info-bg); border: 1px solid rgba(0, 136, 255, 0.1); color: var(--color-info); }

        /* CHECK-OUT */
        .checkout-details-table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        .checkout-details-table td {
          padding: 12px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 14px;
        }
        .checkout-details-table td.label {
          color: var(--text-secondary);
          font-weight: 500;
        }
        .checkout-details-table td.value {
          text-align: right;
          font-weight: 600;
          color: var(--text-primary);
        }
        .checkout-total-row td {
          border-top: 1px solid #cbd5e1;
          padding-top: 16px;
        }
        .checkout-total-row .checkout-total-val {
          font-size: 20px;
          color: var(--color-error);
          font-weight: 800;
        }
        .qr-display {
          text-align: center;
          margin: 20px 0;
          background-color: #f8fafc;
          padding: 24px;
          border-radius: 12px;
          border: 1px dashed #cbd5e1;
        }
        .qr-display img {
          max-width: 160px;
          height: auto;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          border-radius: 6px;
        }
        .manual-btn {
          width: 100%;
          padding: 12px;
          background-color: #d97706;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
        }
        .manual-btn:hover { background-color: #b45309; }

        /* MOCK AI CAMERA UI */
        .mock-webcam {
          height: 140px;
          background-color: #1e293b;
          border-radius: 10px;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          color: #ffffff;
          margin-bottom: 16px;
          overflow: hidden;
        }
        .webcam-silhouette {
          padding: 10px 16px;
          border-radius: 30px;
          border: 2px dashed rgba(255,255,255,0.3);
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          background-color: rgba(255,255,255,0.05);
        }
        .face-option-grid {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
        }
        .face-option {
          flex: 1;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 10px;
          text-align: center;
          font-size: 12px;
          cursor: pointer;
          background-color: #fff;
          font-weight: 500;
          transition: all 0.2s;
        }
        .face-option.active {
          border-color: var(--accent-color);
          background-color: var(--color-info-bg);
          color: var(--accent-color);
          font-weight: 700;
        }

        /* TABLES */
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        .data-table th, .data-table td {
          padding: 14px 16px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
          font-size: 13px;
        }
        .data-table th {
          background-color: #f8fafc;
          font-weight: 700;
          color: var(--text-secondary);
        }
        .data-table td {
          color: var(--text-primary);
        }

        /* REPORT SVG CHARTS */
        .chart-box {
          display: flex;
          flex-direction: column;
          margin-top: 15px;
          gap: 12px;
        }
        .chart-row {
          display: flex;
          align-items: center;
        }
        .chart-label {
          width: 60px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .chart-bar-container {
          flex-grow: 1;
          background-color: #f1f5f9;
          height: 18px;
          border-radius: 6px;
          overflow: hidden;
          margin: 0 15px;
        }
        .chart-bar {
          background: linear-gradient(90deg, var(--accent-color) 0%, #8000ff 100%);
          height: 100%;
          border-radius: 6px;
          transition: width 0.8s ease-out;
        }
        .chart-value {
          width: 80px;
          font-size: 12px;
          font-weight: 700;
          text-align: right;
          color: var(--text-primary);
        }
      ` }} />

      {/* SIDEBAR NAVIGATION */}
      <div className="sidebar">
        <div>
          <div className="sidebar-brand">
            <div className="brand-icon">
              <Icon name="parking-square" size={28} />
            </div>
            <div className="brand-text">
              <h1>NEXUS</h1>
              <span>Bãi đỗ thông minh</span>
            </div>
          </div>
          <ul className="sidebar-menu">
            <li className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <Icon name="layout-dashboard" size={18} />
              <span>Bảng điều khiển chung</span>
            </li>
            <li className={`sidebar-item ${activeTab === 'sodo' ? 'active' : ''}`} onClick={() => setActiveTab('sodo')}>
              <Icon name="map" size={18} />
              <span>Sơ đồ mặt bằng</span>
            </li>
            <li className={`sidebar-item ${activeTab === 'checkin' ? 'active' : ''}`} onClick={() => setActiveTab('checkin')}>
              <Icon name="plus-circle" size={18} />
              <span>Check-in xe vào</span>
            </li>
            <li className={`sidebar-item ${activeTab === 'checkout' ? 'active' : ''}`} onClick={() => setActiveTab('checkout')}>
              <Icon name="door-closed" size={18} />
              <span>Check-out & Tính tiền</span>
            </li>
            <li className={`sidebar-item ${activeTab === 'monthly' ? 'active' : ''}`} onClick={() => setActiveTab('monthly')}>
              <Icon name="users" size={18} />
              <span>Đăng ký thẻ tháng</span>
            </li>
            {user.role === 'admin' && (
              <li className={`sidebar-item ${activeTab === 'config' ? 'active' : ''}`} onClick={() => setActiveTab('config')}>
                <Icon name="sliders" size={18} />
                <span>Cấu hình & Quản trị</span>
              </li>
            )}
          </ul>
        </div>
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">
              {user.name ? user.name.split(' ').pop().substring(0, 2).toUpperCase() : 'QT'}
            </div>
            <div className="user-info">
              <span className="name">{user.name}</span>
              <span className="role">{user.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}</span>
            </div>
          </div>
          <button className="logout-btn-nexus" title="Đăng xuất" onClick={handleLogout}>
            <Icon name="power" size={18} />
          </button>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="main-content">
        <div className="content-header">
          <div className="header-left">
            <h2>
              {activeTab === 'dashboard' && 'Bảng Điều Khiển Chung'}
              {activeTab === 'sodo' && 'Sơ Đồ Mặt Bằng Realtime'}
              {activeTab === 'checkin' && 'Thủ Tục Xe Vào Bãi (Check-in)'}
              {activeTab === 'checkout' && 'Thủ Tục Xe Ra & Thanh Toán'}
              {activeTab === 'monthly' && 'Quản Lý Thẻ Tháng'}
              {activeTab === 'config' && 'Cấu Hình Hệ Thống'}
            </h2>
            <p>
              {activeTab === 'dashboard' && 'Theo dõi trạng thái bãi đỗ xe và hệ thống điều hành thời gian thực.'}
              {activeTab === 'sodo' && 'Bản đồ các vị trí trống/đầy của phân khu xăng và điện.'}
              {activeTab === 'checkin' && 'Ghi nhận thông tin xe vào bãi và phân phối slot đỗ trống.'}
              {activeTab === 'checkout' && 'Tính phí dịch vụ đỗ sạc xe và hiển thị cổng quét mã QR.'}
              {activeTab === 'monthly' && 'Đăng ký và gia hạn dịch vụ thẻ đỗ xe tháng.'}
              {activeTab === 'config' && 'Cấu hình giá block giờ, quy mô slots và nhân viên.'}
            </p>
          </div>
          <div className="header-right">
            <div className="system-status">
              <span className={`status-indicator ${socketConnected ? 'online' : 'offline'}`} />
              <span>HỆ THỐNG {socketConnected ? 'ONLINE' : 'OFFLINE'}</span>
            </div>
            <div style={{ height: '24px', width: '1px', backgroundColor: '#e2e8f0' }} />
            <div className="live-clock">
              <Icon name="clock" size={16} />
              <span>{currentTime}</span>
            </div>
          </div>
        </div>

        <div className="content-body">
          {/* Realtime Notification Toast */}
          {lastPaymentNotification && (
            <div className={`notification-toast ${lastPaymentNotification.type === 'success' ? 'success' : ''}`}>
              <div>
                <div className="toast-title">🔔 {lastPaymentNotification.title} ({lastPaymentNotification.time})</div>
                <div className="toast-body">{lastPaymentNotification.message}</div>
              </div>
              <button 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontWeight: 'bold' }} 
                onClick={() => setLastPaymentNotification(null)}
              >
                ✕
              </button>
            </div>
          )}

          {/* TAB 0: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div>
              {/* KPI Stats Grid */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Tỉ Lệ Lấp Đầy</span>
                    <div className="stat-icon-wrapper blue"><Icon name="pie-chart" size={16} /></div>
                  </div>
                  <div className="stat-value-container">
                    <span className="stat-value">{occupancyRate}%</span>
                    <span className="stat-subtext text-success">
                      <Icon name="arrow-down-right" size={12} /> -1.2% so với giờ trước
                    </span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill blue" style={{ width: `${occupancyRate}%` }}></div>
                  </div>
                  <div className="stat-footer-metrics">
                    <span>Đang đỗ: <strong>{occupiedSlotsCount}</strong></span>
                    <span>Tổng số slot: <strong>{totalSlotsCount}</strong></span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Trạm Sạc EV</span>
                    <div className="stat-icon-wrapper green"><Icon name="zap" size={16} /></div>
                  </div>
                  <div className="stat-value-container">
                    <span className="stat-value">{activeEvChargers} / {slots.dien.length}</span>
                    <span className="stat-subtext text-warning">Tổng tải sạc: {activeEvChargers * 7.4} kW</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill green" style={{ width: `${slots.dien.length > 0 ? (activeEvChargers / slots.dien.length) * 100 : 0}%` }}></div>
                  </div>
                  <div className="stat-footer-metrics">
                    <span>TB sạc: <strong>7.4 kW/xe</strong></span>
                    <span>Slot trống: <strong>{slots.dien.filter(s => s.status === 'Available').length}</strong></span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Doanh Thu Hệ Thống</span>
                    <div className="stat-icon-wrapper orange"><Icon name="bar-chart-3" size={16} /></div>
                  </div>
                  <div className="stat-value-container">
                    <span className="stat-value">{reportsData.totalRevenue.toLocaleString()}đ</span>
                    <span className="stat-subtext text-success">
                      <Icon name="arrow-up-right" size={12} /> +14.5% so với hôm qua
                    </span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill orange" style={{ width: '85%' }}></div>
                  </div>
                  <div className="stat-footer-metrics">
                    <span>Xe Xăng: <strong>{reportsData.revenueXang.toLocaleString()}đ</strong></span>
                    <span>Xe Điện: <strong>{reportsData.revenueDien.toLocaleString()}đ</strong></span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Lưu Lượng Thẻ Tháng</span>
                    <div className="stat-icon-wrapper purple"><Icon name="users" size={16} /></div>
                  </div>
                  <div className="stat-value-container">
                    <span className="stat-value">{monthlyCards.length}</span>
                    <span className="stat-subtext text-success">Thẻ đang hoạt động</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill purple" style={{ width: '60%' }}></div>
                  </div>
                  <div className="stat-footer-metrics">
                    <span>Xe Điện: <strong>{monthlyCards.filter(c => c.type === 'dien').length}</strong></span>
                    <span>Xe Xăng: <strong>{monthlyCards.filter(c => c.type === 'xang').length}</strong></span>
                  </div>
                </div>
              </div>

              {/* BARRIER REALTIME DISPLAY */}
              <div className="barrier-container-nexus">
                <div className="barrier-info">
                  <h3>CỔNG RÀO CHẮN AN NINH (BARRIER)</h3>
                  <p>Trạng thái điều khiển rào chắn khẩn cấp tự động mở khi thanh toán hoàn tất.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                  <div className="barrier-graphic-nexus">
                    <div className="barrier-post-nexus"></div>
                    <div className={`barrier-gate-nexus ${barrierState === 'open' || barrierState === 'opening' ? 'open' : 'closed'}`}></div>
                  </div>
                  <div>
                    <span className={`barrier-badge ${barrierState === 'closed' ? 'closed' : (barrierState === 'open' ? 'open' : 'moving')}`}>
                      {barrierState === 'closed' && 'RÀO CHẮN ĐÓNG ⛔'}
                      {barrierState === 'opening' && 'ĐANG MỞ RÀO... ⏳'}
                      {barrierState === 'open' && 'RÀO CHẮN MỞ ✅'}
                      {barrierState === 'closing' && 'ĐANG ĐÓNG RÀO... ⏳'}
                    </span>
                  </div>
                </div>
              </div>

              {/* LỊCH SỬ GIAO DỊCH VÀ BIỂU ĐỒ TRỰC QUAN */}
              <div className="grid-2">
                <div className="card">
                  <div className="card-header-nexus">Biểu đồ doanh thu 7 ngày gần nhất</div>
                  <div className="chart-box">
                    {reportsData.dailyReport.map(item => {
                      const maxRevenue = Math.max(...reportsData.dailyReport.map(d => d.revenue), 100000);
                      const percent = (item.revenue / maxRevenue) * 100;
                      return (
                        <div key={item.date} className="chart-row">
                          <div className="chart-label">{item.date}</div>
                          <div className="chart-bar-container">
                            <div className="chart-bar" style={{ width: `${percent}%` }}></div>
                          </div>
                          <div className="chart-value">{item.revenue.toLocaleString()}đ</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="card">
                  <div className="card-header-nexus">Phân khu đỗ xe hiện tại</div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Khu vực</th>
                        <th>Đang đỗ</th>
                        <th>Còn trống</th>
                        <th>Lấp đầy</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Khu Xe Điện ⚡</strong></td>
                        <td>{reportsData.occupancy.dien.occupied}</td>
                        <td>{reportsData.occupancy.dien.free}</td>
                        <td>
                          <span style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>
                            {Math.round((reportsData.occupancy.dien.occupied / Math.max(1, reportsData.occupancy.dien.total)) * 100)}%
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Khu Xe Xăng ⛽</strong></td>
                        <td>{reportsData.occupancy.xang.occupied}</td>
                        <td>{reportsData.occupancy.xang.free}</td>
                        <td>
                          <span style={{ fontWeight: 'bold', color: 'var(--color-success)' }}>
                            {Math.round((reportsData.occupancy.xang.occupied / Math.max(1, reportsData.occupancy.xang.total)) * 100)}%
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: SƠ ĐỒ MẶT BẰNG */}
          {activeTab === 'sodo' && (
            <div>
              <div className="card">
                <div className="card-header-nexus">
                  <span>Trạng thái bãi đỗ xe trực quan</span>
                  <div style={{ display: 'flex', gap: '15px', fontSize: '12px' }}>
                    <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>● Trống (Available)</span>
                    <span style={{ color: 'var(--color-error)', fontWeight: 'bold' }}>● Có xe (Occupied)</span>
                    <span style={{ color: 'var(--color-warning)', fontWeight: 'bold' }}>● Đang chờ (Pending)</span>
                  </div>
                </div>

                <div className="zone-container">
                  <div className="zone-header-nexus">
                    <Icon name="zap" size={16} color="var(--accent-color)" />
                    <span>PHÂN KHU A - KHU XE ĐIỆN ⚡</span>
                  </div>
                  <div className="slots-grid">
                    {slots.dien.map(slot => (
                      <div 
                        key={slot.id} 
                        className={`slot-card-nexus ${slot.status}`}
                        onClick={() => {
                          if (slot.status === 'Occupied' || slot.status === 'Pending') {
                            setCheckOutPlate(slot.vehiclePlate);
                            setActiveTab('checkout');
                            fetchActiveSession(slot.vehiclePlate);
                          } else {
                            setActiveTab('checkin');
                            setCheckInType('dien');
                          }
                        }}
                      >
                        <div className="slot-id-nexus">{slot.id}</div>
                        <div className="slot-status-lbl">
                          {slot.status === 'Available' ? 'Trống' : (slot.status === 'Occupied' ? 'Có Xe' : 'Đang Chờ')}
                        </div>
                        {slot.vehiclePlate && <div className="slot-plate-nexus">{slot.vehiclePlate}</div>}
                        {slot.charging && <div className="slot-charging-badge">Đang Sạc</div>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="zone-container" style={{ marginTop: '40px' }}>
                  <div className="zone-header-nexus">
                    <Icon name="car" size={16} color="var(--color-success)" />
                    <span>PHÂN KHU B - KHU XE XĂNG ⛽</span>
                  </div>
                  <div className="slots-grid">
                    {slots.xang.map(slot => (
                      <div 
                        key={slot.id} 
                        className={`slot-card-nexus ${slot.status}`}
                        onClick={() => {
                          if (slot.status === 'Occupied' || slot.status === 'Pending') {
                            setCheckOutPlate(slot.vehiclePlate);
                            setActiveTab('checkout');
                            fetchActiveSession(slot.vehiclePlate);
                          } else {
                            setActiveTab('checkin');
                            setCheckInType('xang');
                          }
                        }}
                      >
                        <div className="slot-id-nexus">{slot.id}</div>
                        <div className="slot-status-lbl">
                          {slot.status === 'Available' ? 'Trống' : (slot.status === 'Occupied' ? 'Có Xe' : 'Đang Chờ')}
                        </div>
                        {slot.vehiclePlate && <div className="slot-plate-nexus">{slot.vehiclePlate}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHECK-IN */}
          {activeTab === 'checkin' && (
            <div className="grid-2">
              <div className="card">
                <div className="card-header-nexus">Khai báo thông tin xe vào</div>
                {checkInMessage.text && (
                  <div className={`alert-box ${checkInMessage.type}`}>{checkInMessage.text}</div>
                )}
                <form onSubmit={handleCheckInSubmit}>
                  <div className="form-row">
                    <label>Biển số phương tiện</label>
                    <input 
                      type="text" 
                      placeholder="Ví dụ: 30A-99999" 
                      value={checkInPlate}
                      onChange={(e) => setCheckInPlate(e.target.value.toUpperCase())}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <label>Phân loại động cơ</label>
                    <select value={checkInType} onChange={(e) => setCheckInType(e.target.value)}>
                      <option value="xang">Động cơ xăng / dầu ⛽</option>
                      <option value="dien">Động cơ điện ⚡</option>
                    </select>
                  </div>
                  <div className="form-row">
                    <label>Camera AI nhận diện khuôn mặt (Mô phỏng)</label>
                    <div className="mock-webcam">
                      <div className="webcam-silhouette">
                        📸 KẾT NỐI CAMERA AI...
                      </div>
                    </div>
                    <div className="face-option-grid">
                      <div className={`face-option ${faceMockSelected === 'face1' ? 'active' : ''}`} onClick={() => setFaceMockSelected('face1')}>Khách Vãng Lai (Vé Lượt)</div>
                      <div className={`face-option ${faceMockSelected === 'face2' ? 'active' : ''}`} onClick={() => setFaceMockSelected('face2')}>Chủ Thẻ Tháng (Đã Lưu)</div>
                      <div className={`face-option ${faceMockSelected === 'face_error' ? 'active' : ''}`} onClick={() => setFaceMockSelected('face_error')}>Nhận diện khuôn mặt Lỗi</div>
                    </div>
                  </div>
                  <button type="submit" className="submit-btn-nexus">Xác nhận Check-in</button>
                </form>
              </div>

              <div className="card">
                <div className="card-header-nexus">Nguyên tắc xếp vị trí</div>
                <div style={{ fontSize: '13px', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
                  <p style={{ marginBottom: '12px' }}>1. <strong>Tự động xếp slot</strong>: Hệ thống sẽ tự tìm và gán vị trí trống có chỉ số nhỏ nhất của phân khu tương ứng.</p>
                  <p style={{ marginBottom: '12px' }}>2. <strong>Nhận diện thẻ tháng</strong>: Đối soát biển số đỗ với danh bạ thẻ tháng để tự động áp dụng gói phí tháng trọn gói 0đ.</p>
                  <p style={{ marginBottom: '12px' }}>3. <strong>Xử lý ngoại lệ</strong>: Nếu Camera AI báo lỗi nhận diện khuôn mặt, nhân viên trực cổng cần xác nhận kiểm tra thủ công bằng biển số giấy tờ.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHECK-OUT */}
          {activeTab === 'checkout' && (
            <div className="grid-2">
              <div className="card">
                <div className="card-header-nexus">Yêu cầu tính toán chi phí checkout</div>
                {checkoutMessage.text && (
                  <div className={`alert-box ${checkoutMessage.type}`}>{checkoutMessage.text}</div>
                )}
                <form onSubmit={handleCheckOutRequest}>
                  <div className="form-row">
                    <label>Biển số xe check-out</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input 
                        type="text" 
                        placeholder="Ví dụ: 30E-11111" 
                        value={checkOutPlate}
                        onChange={(e) => setCheckOutPlate(e.target.value.toUpperCase())}
                        required
                      />
                      <button type="submit" style={{ width: '130px', padding: '10px', background: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' }}>Tìm kiếm</button>
                    </div>
                  </div>
                </form>

                {checkoutSession && checkoutDetails && (
                  <div style={{ marginTop: '24px' }}>
                    <div className="card-header-nexus" style={{ marginBottom: '12px' }}>Hóa đơn dịch vụ đỗ xe</div>
                    <table className="checkout-details-table">
                      <tbody>
                        <tr>
                          <td className="label">Biển số phương tiện</td>
                          <td className="value">{checkoutSession.licensePlate}</td>
                        </tr>
                        <tr>
                          <td className="label">Vị trí đỗ</td>
                          <td className="value"><span style={{ padding: '3px 8px', background: '#f1f5f9', borderRadius: '6px', fontWeight: '700' }}>{checkoutSession.slotId}</span></td>
                        </tr>
                        <tr>
                          <td className="label">Thời điểm vào</td>
                          <td className="value">{new Date(checkoutSession.checkInTime).toLocaleString('vi-VN')}</td>
                        </tr>
                        <tr>
                          <td className="label">Loại vé dịch vụ</td>
                          <td className="value">{checkoutSession.isMonthlyCard ? 'Thẻ tháng (Miễn phí đỗ)' : 'Vé lượt đỗ'}</td>
                        </tr>
                        <tr>
                          <td className="label">Chi tiết cách tính</td>
                          <td className="value" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{checkoutDetails.detail}</td>
                        </tr>
                        <tr className="checkout-total-row">
                          <td className="label checkout-total-val" style={{ fontSize: '15px', color: 'var(--text-primary)' }}>Tổng cộng</td>
                          <td className="value checkout-total-val">{checkoutDetails.amount.toLocaleString()} VNĐ</td>
                        </tr>
                      </tbody>
                    </table>

                    {checkoutDetails.amount > 0 && (
                      <div>
                        {checkoutDetails.qrCode ? (
                          <div className="qr-display">
                            <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px' }}>MÃ QR ĐỘNG KHÁCH HÀNG QUÉT THANH TOÁN</div>
                            <img src={checkoutDetails.qrCode} alt="Payment QR" />
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>Mã QR chứa nội dung chuyển khoản định danh tự động mở barrier.</div>
                          </div>
                        ) : (
                          <div className="alert-box error">Chưa cấu hình được cổng quét mã QR từ máy chủ.</div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <button className="manual-btn" onClick={handleManualOpen}>
                            🛠️ Xác nhận thủ công (Handle Manual Review)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="card">
                <div className="card-header-nexus">Các xe đang trong bãi đỗ</div>
                <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Biển số</th>
                        <th>Slot</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...slots.xang, ...slots.dien]
                        .filter(s => s.status === 'Occupied' || s.status === 'Pending')
                        .map(slot => (
                          <tr key={slot.id}>
                            <td><strong>{slot.vehiclePlate}</strong></td>
                            <td><span style={{ padding: '3px 8px', background: '#f1f5f9', borderRadius: '6px', fontWeight: 'bold' }}>{slot.id}</span></td>
                            <td>
                              <button 
                                onClick={() => {
                                  setCheckOutPlate(slot.vehiclePlate);
                                  fetchActiveSession(slot.vehiclePlate);
                                }}
                                style={{ padding: '6px 12px', background: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                              >
                                Check-out
                              </button>
                            </td>
                          </tr>
                        ))
                      }
                      {[...slots.xang, ...slots.dien].filter(s => s.status === 'Occupied' || s.status === 'Pending').length === 0 && (
                        <tr>
                          <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Không có xe nào đang đỗ trong bãi.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ĐĂNG KÝ THÈ THÁNG */}
          {activeTab === 'monthly' && (
            <div className="grid-2">
              <div className="card">
                <div className="card-header-nexus">Đăng ký Thẻ đỗ xe tháng</div>
                {monthlyMessage.text && (
                  <div className={`alert-box ${monthlyMessage.type}`}>{monthlyMessage.text}</div>
                )}
                <form onSubmit={handleMonthlySubmit}>
                  <div className="form-row">
                    <label>Họ và tên chủ phương tiện</label>
                    <input 
                      type="text" 
                      placeholder="Nhập họ tên đầy đủ"
                      value={monthlyForm.ownerName}
                      onChange={(e) => setMonthlyForm({ ...monthlyForm, ownerName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <label>Biển kiểm soát đăng ký</label>
                    <input 
                      type="text" 
                      placeholder="Ví dụ: 30A-12345"
                      value={monthlyForm.licensePlate}
                      onChange={(e) => setMonthlyForm({ ...monthlyForm, licensePlate: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <label>Số điện thoại liên lạc</label>
                    <input 
                      type="tel" 
                      placeholder="Nhập số điện thoại chủ xe"
                      value={monthlyForm.phone}
                      onChange={(e) => setMonthlyForm({ ...monthlyForm, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <label>Gói dịch vụ đăng ký</label>
                    <select value={monthlyForm.type} onChange={(e) => setMonthlyForm({ ...monthlyForm, type: e.target.value })}>
                      <option value="xang">Thẻ xe xăng (Trọn gói: 150.000đ/tháng)</option>
                      <option value="dien">Thẻ xe điện sạc (Trọn gói: 200.000đ/tháng)</option>
                    </select>
                  </div>
                  <button type="submit" className="submit-btn-nexus">Đăng ký thẻ</button>
                </form>
              </div>

              <div className="card">
                <div className="card-header-nexus">Danh sách Thẻ tháng đã cấp phát</div>
                <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Họ tên</th>
                        <th>Biển số</th>
                        <th>Hạn dùng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyCards.map(card => (
                        <tr key={card.cardNumber}>
                          <td>
                            <strong>{card.ownerName}</strong>
                            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Mã: {card.cardNumber}</div>
                          </td>
                          <td><strong>{card.licensePlate}</strong></td>
                          <td>
                            <span style={{ fontSize: '11px', color: '#137333', background: '#e6f4ea', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>
                              {card.expiryDate}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CONFIG (ADMIN ONLY) */}
          {activeTab === 'config' && user.role === 'admin' && (
            <div className="grid-2">
              <div>
                <div className="card">
                  <div className="card-header-nexus">Cấu hình Đơn giá đỗ & sạc</div>
                  {configMessage.text && (
                    <div className={`alert-box ${configMessage.type}`}>{configMessage.text}</div>
                  )}
                  <form onSubmit={handleSavePricing}>
                    <div className="form-row">
                      <label>Giá đỗ xe Xăng (đ/giờ)</label>
                      <input 
                        type="number" 
                        value={pricingConfig.xangPerHour} 
                        onChange={(e) => setPricingConfig({ ...pricingConfig, xangPerHour: e.target.value })}
                      />
                    </div>
                    <div className="form-row">
                      <label>Giá đỗ xe Điện (đ/giờ)</label>
                      <input 
                        type="number" 
                        value={pricingConfig.dienPerHour} 
                        onChange={(e) => setPricingConfig({ ...pricingConfig, dienPerHour: e.target.value })}
                      />
                    </div>
                    <div className="form-row">
                      <label>Giá sạc xe Điện phát sinh (đ/kWh)</label>
                      <input 
                        type="number" 
                        value={pricingConfig.dienChargingPerKwh} 
                        onChange={(e) => setPricingConfig({ ...pricingConfig, dienChargingPerKwh: e.target.value })}
                      />
                    </div>
                    <button type="submit" className="submit-btn-nexus">Cập nhật đơn giá</button>
                  </form>
                </div>

                <div className="card">
                  <div className="card-header-nexus">Quy mô số lượng slot phân khu</div>
                  <form onSubmit={handleSaveSlots}>
                    <div className="form-row">
                      <label>Số slot Phân khu Xe Xăng</label>
                      <input 
                        type="number" 
                        value={slotConfig.countXang} 
                        onChange={(e) => setSlotConfig({ ...slotConfig, countXang: Number(e.target.value) })}
                      />
                    </div>
                    <div className="form-row">
                      <label>Số slot Phân khu Xe Điện</label>
                      <input 
                        type="number" 
                        value={slotConfig.countDien} 
                        onChange={(e) => setSlotConfig({ ...slotConfig, countDien: Number(e.target.value) })}
                      />
                    </div>
                    <button type="submit" className="submit-btn-nexus">Cập nhật số lượng slot</button>
                  </form>
                </div>
              </div>

              <div>
                <div className="card">
                  <div className="card-header-nexus">Thêm tài khoản nhân viên trực cổng</div>
                  <form onSubmit={handleAddStaff} style={{ marginBottom: '25px' }}>
                    <div className="form-row">
                      <label>Tên đăng nhập</label>
                      <input 
                        type="text" 
                        placeholder="Nhập tên đăng nhập" 
                        value={newStaffForm.username}
                        onChange={(e) => setNewStaffForm({ ...newStaffForm, username: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-row">
                      <label>Mật khẩu đăng nhập</label>
                      <input 
                        type="password" 
                        placeholder="Nhập mật khẩu" 
                        value={newStaffForm.password}
                        onChange={(e) => setNewStaffForm({ ...newStaffForm, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-row">
                      <label>Họ tên đầy đủ</label>
                      <input 
                        type="text" 
                        placeholder="Nhập họ và tên" 
                        value={newStaffForm.name}
                        onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-row">
                      <label>Vai trò hệ thống</label>
                      <select value={newStaffForm.role} onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value })}>
                        <option value="staff">Nhân viên trực cổng (Staff)</option>
                        <option value="admin">Quản trị viên hệ thống (Admin)</option>
                      </select>
                    </div>
                    <button type="submit" className="submit-btn-nexus" style={{ background: 'var(--color-success)' }}>
                      Tạo tài khoản
                    </button>
                  </form>

                  <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                    <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '12px' }}>Danh sách tài khoản hoạt động</label>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Tài khoản</th>
                          <th>Tên hiển thị</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffList.map(staff => (
                          <tr key={staff.username}>
                            <td>
                              <strong>{staff.username}</strong>
                              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Quyền: {staff.role === 'admin' ? 'Quản trị' : 'Nhân viên'}</div>
                            </td>
                            <td>{staff.name}</td>
                            <td>
                              {staff.username !== 'admin' ? (
                                <button 
                                  onClick={() => handleDeleteStaff(staff.username)}
                                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-error)' }}
                                  title="Xoá tài khoản"
                                >
                                  <Icon name="trash" size={16} />
                                </button>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Mặc định</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
