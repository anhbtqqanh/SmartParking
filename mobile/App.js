import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import io from 'socket.io-client';
import { useFonts } from 'expo-font';

// ==================== CẤU HÌNH LIÊN KẾT BACKEND ====================
// Giả lập Android Studio: Dùng 10.0.2.2 (IP đặc biệt trỏ về máy host)
// Điện thoại thật qua LAN: Đổi thành IP Wifi máy tính (ví dụ: 192.168.1.15)
const BASE_URL = "http://10.0.2.2:5000"; 
// ===================================================================

export default function App() {
  // Tải font chữ Google Sans Flex cục bộ
  const [fontsLoaded] = useFonts({
    'GoogleSansFlex': require('./assets/fonts/GoogleSansFlex.ttf'),
  });

  // Trạng thái xác thực (Authentication)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' hoặc 'register'
  const [user, setUser] = useState(null); // { username, name, phone, licensePlate }
  
  // Form Đăng nhập
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  // Form Đăng ký
  const [registerForm, setRegisterForm] = useState({ username: '', password: '', name: '', phone: '', licensePlate: '' });

  // Trạng thái vận hành ứng dụng
  const [currentTab, setCurrentTab] = useState('search'); // 'search', 'monthly', 'history'
  const [serverConnected, setServerConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);

  // States cho Tra cứu & Thanh toán
  const [searchPlate, setSearchPlate] = useState('');
  const [activeSession, setActiveSession] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // States cho Thẻ tháng
  const [monthlyCard, setMonthlyCard] = useState(null);
  const [monthlyForm, setMonthlyForm] = useState({ type: 'xang' });

  // Lắng nghe sự kiện đồng bộ thời gian thực từ Socket
  useEffect(() => {
    if (!isLoggedIn) return;

    console.log(`[Mobile] Đang kết nối tới: ${BASE_URL}`);
    const socket = io(BASE_URL, {
      transports: ['websocket'],
      forceNew: true
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setServerConnected(true);
      console.log('[Mobile] Đã kết nối thành công tới server qua Socket!');
    });

    socket.on('disconnect', () => {
      setServerConnected(false);
      console.log('[Mobile] Mất kết nối tới server.');
    });

    socket.on('payment_success', (data) => {
      if (activeSession && data.licensePlate === activeSession.licensePlate) {
        setPaymentSuccess(true);
        setQrCodeData(null);
        Alert.alert(
          "Thanh toán thành công 🎉", 
          `Hóa đơn xe ${data.licensePlate} đã được thanh toán. Rào chắn tự động mở, chúc bạn lái xe an toàn!`,
          [{ text: "Đồng ý", onPress: () => resetSearch() }]
        );
        fetchMonthlyCard(user.licensePlate); // Cập nhật lại thẻ tháng nếu có thay đổi
      }
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [isLoggedIn, activeSession]);

  // Tự động gán biển số xe của khách hàng đã đăng nhập vào ô tìm kiếm
  useEffect(() => {
    if (user && user.licensePlate) {
      setSearchPlate(user.licensePlate);
      fetchMonthlyCard(user.licensePlate);
    }
  }, [user]);

  const resetSearch = () => {
    setActiveSession(null);
    setQrCodeData(null);
    setPaymentSuccess(false);
  };

  // Chuẩn hóa biển số viết hoa tự động
  const handleLicensePlateChange = (text, formType) => {
    const formatted = text.toUpperCase();
    if (formType === 'register') {
      setRegisterForm({ ...registerForm, licensePlate: formatted });
    } else if (formType === 'search') {
      setSearchPlate(formatted);
    }
  };

  // Gọi API Đăng nhập khách hàng
  const handleLogin = async () => {
    if (!loginForm.username.trim() || !loginForm.password.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ tài khoản và mật khẩu.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/customer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUser(data.user);
        setIsLoggedIn(true);
        setLoginForm({ username: '', password: '' });
      } else {
        Alert.alert("Lỗi", data.message || "Tài khoản hoặc mật khẩu không chính xác.");
      }
    } catch (error) {
      alertConnectionError();
    } finally {
      setLoading(false);
    }
  };

  // Gọi API Đăng ký khách hàng
  const handleRegister = async () => {
    const { username, password, name, phone, licensePlate } = registerForm;
    if (!username.trim() || !password.trim() || !name.trim() || !phone.trim() || !licensePlate.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin đăng ký.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/customer/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        Alert.alert("Thành công", "Đăng ký tài khoản thành công! Tiến hành đăng nhập.");
        setUser(data.user);
        setIsLoggedIn(true);
        setRegisterForm({ username: '', password: '', name: '', phone: '', licensePlate: '' });
      } else {
        Alert.alert("Thất bại", data.message || "Đăng ký không thành công.");
      }
    } catch (error) {
      alertConnectionError();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.confirm ? Alert.confirm(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        { text: "Hủy" },
        { text: "Đăng xuất", onPress: () => { setIsLoggedIn(false); setUser(null); resetSearch(); setMonthlyCard(null); } }
      ]
    ) : Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        { text: "Hủy" },
        { text: "Đăng xuất", onPress: () => { setIsLoggedIn(false); setUser(null); resetSearch(); setMonthlyCard(null); } }
      ]
    );
  };

  // Tra cứu hóa đơn đỗ xe
  const handleSearchSession = async () => {
    if (!searchPlate.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập biển số xe!");
      return;
    }
    setLoading(true);
    setPaymentSuccess(false);
    try {
      const response = await fetch(`${BASE_URL}/api/sessions/active/${searchPlate.trim().toUpperCase()}`);
      const data = await response.json();
      if (response.ok && data.success) {
        setActiveSession(data.session);
        setQrCodeData(data.qrCode);
      } else {
        resetSearch();
        Alert.alert("Thông báo", data.message || "Không có phiên xe đỗ hoạt động.");
      }
    } catch (error) {
      alertConnectionError();
    } finally {
      setLoading(false);
    }
  };

  // Yêu cầu Staff Check-out tạo QR thanh toán
  const handleRequestCheckout = async () => {
    if (!activeSession) return;
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/check-out/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licensePlate: activeSession.licensePlate })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setActiveSession(data.session);
        setQrCodeData(data.qrCode);
        if (data.amount === 0) {
          Alert.alert("Thông báo", "Xe thẻ tháng hợp lệ, barrier tự động mở miễn phí.");
          resetSearch();
        } else {
          Alert.alert("Thành công", "Mã QR chuyển khoản định danh đã được khởi tạo.");
        }
      } else {
        Alert.alert("Lỗi", data.message || "Không thể gửi yêu cầu check-out.");
      }
    } catch (error) {
      alertConnectionError();
    } finally {
      setLoading(false);
    }
  };

  // Khách hàng nhấn Xác nhận đã chuyển khoản thành công
  const handleConfirmPayment = () => {
    if (!activeSession) return;
    if (socketRef.current && serverConnected) {
      setLoading(true);
      // Phát tín hiệu Socket.io
      socketRef.current.emit('payment_confirm', { sessionId: activeSession.id });
      
      // Dự phòng bằng REST API để đồng bộ DB
      fetch(`${BASE_URL}/api/payment/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeSession.id })
      })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.success) {
          setPaymentSuccess(true);
          setQrCodeData(null);
          Alert.alert("Thành công", "Yêu cầu xác thực đã gửi. Barrier đang được mở.");
        } else {
          Alert.alert("Lỗi", data.message || "Xác thực giao dịch thất bại.");
        }
      })
      .catch(() => {
        setLoading(false);
        Alert.alert("Lỗi", "Kết nối tới server bị lỗi.");
      });
    } else {
      Alert.alert("Lỗi kết nối", "Ứng dụng chưa liên kết được Socket. Vui lòng kiểm tra Wifi.");
    }
  };

  // Lấy thông tin thẻ tháng của biển số xe
  const fetchMonthlyCard = async (plate) => {
    try {
      const response = await fetch(`${BASE_URL}/api/monthly-cards`);
      const cards = await response.json();
      const card = cards.find(c => c.licensePlate === plate.trim().toUpperCase());
      setMonthlyCard(card || null);
    } catch (error) {
      console.log('Không lấy được dữ liệu thẻ tháng');
    }
  };

  // Đăng ký thẻ tháng mới
  const handleRegisterMonthly = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/monthly-cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerName: user.name,
          licensePlate: user.licensePlate,
          phone: user.phone,
          type: monthlyForm.type
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setMonthlyCard(data.card);
        Alert.alert("Thành công", `Đăng ký thẻ tháng thành công!\nMã thẻ của bạn: ${data.card.cardNumber}`);
      } else {
        Alert.alert("Thất bại", data.message || "Đăng ký thẻ tháng không thành công.");
      }
    } catch (error) {
      alertConnectionError();
    } finally {
      setLoading(false);
    }
  };

  const alertConnectionError = () => {
    Alert.alert(
      "Lỗi kết nối máy chủ",
      `Không thể kết nối đến địa chỉ:\n${BASE_URL}\n\nHướng dẫn:\n1. Mở file App.js của điện thoại.\n2. Thay đổi YOUR_LOCAL_IP thành IP Wifi máy tính của bạn.\n3. Đảm bảo điện thoại và máy tính chạy server dùng chung mạng Wifi.`
    );
  };

  // Kiểm tra trạng thái tải font
  if (!fontsLoaded) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#1a73e8" />
        <Text style={{ marginTop: 10, color: '#64748b' }}>Đang nạp cấu hình hệ thống...</Text>
      </View>
    );
  }

  // RENDER GIAO DIỆN ĐĂNG NHẬP / ĐĂNG KÝ
  if (!isLoggedIn) {
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.authContainer}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <ScrollView contentContainerStyle={styles.authScroll}>
          <View style={styles.authCard}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoEmoji}>🅿️</Text>
            </View>
            <Text style={styles.authTitle}>NEXUS CLIENT</Text>
            <Text style={styles.authSubtitle}>Hệ thống cổng thông tin đỗ xe thông minh</Text>

            {authMode === 'login' ? (
              <View style={{ width: '100%' }}>
                <Text style={styles.inputLabel}>Tên tài khoản</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập tài khoản (Ví dụ: khach1)"
                  placeholderTextColor="#94a3b8"
                  value={loginForm.username}
                  onChangeText={(text) => setLoginForm({ ...loginForm, username: text })}
                  autoCapitalize="none"
                />

                <Text style={styles.inputLabel}>Mật khẩu bảo mật</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập mật khẩu (Ví dụ: 123)"
                  placeholderTextColor="#94a3b8"
                  value={loginForm.password}
                  onChangeText={(text) => setLoginForm({ ...loginForm, password: text })}
                  secureTextEntry
                />

                <TouchableOpacity style={styles.authBtn} onPress={handleLogin}>
                  <Text style={styles.authBtnText}>Đăng Nhập Hệ Thống</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.switchAuthLink}
                  onPress={() => setAuthMode('register')}
                >
                  <Text style={styles.switchAuthText}>Chưa có tài khoản? Đăng ký ngay</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ width: '100%' }}>
                <Text style={styles.inputLabel}>Tên tài khoản mới</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập tên đăng nhập"
                  placeholderTextColor="#94a3b8"
                  value={registerForm.username}
                  onChangeText={(text) => setRegisterForm({ ...registerForm, username: text })}
                  autoCapitalize="none"
                />

                <Text style={styles.inputLabel}>Mật khẩu</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập mật khẩu truy cập"
                  placeholderTextColor="#94a3b8"
                  value={registerForm.password}
                  onChangeText={(text) => setRegisterForm({ ...registerForm, password: text })}
                  secureTextEntry
                />

                <Text style={styles.inputLabel}>Họ và tên chủ xe</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập họ và tên đầy đủ"
                  placeholderTextColor="#94a3b8"
                  value={registerForm.name}
                  onChangeText={(text) => setRegisterForm({ ...registerForm, name: text })}
                />

                <Text style={styles.inputLabel}>Số điện thoại</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập số điện thoại liên lạc"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  value={registerForm.phone}
                  onChangeText={(text) => setRegisterForm({ ...registerForm, phone: text })}
                />

                <Text style={styles.inputLabel}>Biển kiểm soát xe mặc định</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ví dụ: 30A-99999"
                  placeholderTextColor="#94a3b8"
                  value={registerForm.licensePlate}
                  onChangeText={(text) => handleLicensePlateChange(text, 'register')}
                  autoCapitalize="characters"
                />

                <TouchableOpacity style={[styles.authBtn, { backgroundColor: '#28a745' }]} onPress={handleRegister}>
                  <Text style={styles.authBtnText}>Tạo Tài Khoản Mới</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.switchAuthLink}
                  onPress={() => setAuthMode('login')}
                >
                  <Text style={styles.switchAuthText}>Đã có tài khoản? Quay lại Đăng nhập</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // GIAO DIỆN CHÍNH SAU KHI ĐÃ ĐĂNG NHẬP
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* HEADER NĂNG ĐỘNG */}
      <View style={styles.appHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.welcomeText}>Xin chào,</Text>
          <Text style={styles.userNameText}>{user.name} 👋</Text>
        </View>
        <View style={styles.headerRightBlock}>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, serverConnected ? styles.dotGreen : styles.dotRed]} />
            <Text style={styles.statusText}>{serverConnected ? "Trực tuyến" : "Ngoại tuyến"}</Text>
          </View>
          <TouchableOpacity style={styles.logoutIconButton} onPress={handleLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* TABS ĐỒNG BỘ STYLE NÊN WEB */}
      <View style={styles.appTabBar}>
        <TouchableOpacity 
          style={[styles.appTabBtn, currentTab === 'search' && styles.appTabBtnActive]}
          onPress={() => { setCurrentTab('search'); resetSearch(); }}
        >
          <Text style={[styles.appTabText, currentTab === 'search' && styles.appTabTextActive]}>Tra cứu & Trả phí</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.appTabBtn, currentTab === 'monthly' && styles.appTabBtnActive]}
          onPress={() => { setCurrentTab('monthly'); }}
        >
          <Text style={[styles.appTabText, currentTab === 'monthly' && styles.appTabTextActive]}>Thẻ tháng của tôi</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.globalLoader}>
          <ActivityIndicator size="large" color="#1a73e8" />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.appScroll}>
        
        {/* TAB 1: TRA CỨU & THANH TOÁN */}
        {currentTab === 'search' && (
          <View>
            <View style={styles.contentCard}>
              <Text style={styles.contentCardTitle}>Tra cứu hóa đơn đỗ xe</Text>
              
              <Text style={styles.formInputLabel}>Biển kiểm soát phương tiện</Text>
              <View style={styles.searchRow}>
                <TextInput
                  style={[styles.textInput, { flex: 1, marginBottom: 0 }]}
                  placeholder="Ví dụ: 30A-99999"
                  placeholderTextColor="#94a3b8"
                  value={searchPlate}
                  onChangeText={(text) => handleLicensePlateChange(text, 'search')}
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={styles.searchBtn} onPress={handleSearchSession}>
                  <Text style={styles.searchBtnText}>Tìm</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.quickSelfSearchBtn}
                onPress={() => {
                  setSearchPlate(user.licensePlate);
                  setTimeout(handleSearchSession, 100);
                }}
              >
                <Text style={styles.quickSelfSearchText}>🔍 Tra cứu nhanh xe đăng ký: {user.licensePlate}</Text>
              </TouchableOpacity>
            </View>

            {activeSession && (
              <View style={styles.contentCard}>
                <Text style={styles.contentCardTitle}>Chi tiết phiên đỗ hiện tại</Text>
                
                {/* ẢNH MẶT CHECKIN GIẢ LẬP NHƯ TRÊN WEB */}
                <View style={styles.faceVerificationCard}>
                  <Text style={styles.faceVerifyText}>👤 CAMERA AI: XÁC THỰC KHUÔN MẶT KHỚP 98%</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Biển kiểm soát</Text>
                  <Text style={styles.detailValue}>{activeSession.licensePlate}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Vị trí phân khu</Text>
                  <Text style={styles.detailValue}>
                    {activeSession.vehicleType === 'dien' ? 'Khu Xe Điện ⚡ (Slot ' + activeSession.slotId + ')' : 'Khu Xe Xăng ⛽ (Slot ' + activeSession.slotId + ')'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Thời điểm đỗ vào</Text>
                  <Text style={styles.detailValue}>
                    {new Date(activeSession.checkInTime).toLocaleTimeString('vi-VN')} {new Date(activeSession.checkInTime).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Hình thức đỗ</Text>
                  <Text style={styles.detailValue}>{activeSession.isMonthlyCard ? 'Sử dụng Thẻ tháng' : 'Mua Vé lượt lẻ'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Chi tiết bảng giá</Text>
                  <Text style={styles.detailValueDetail}>{activeSession.detail}</Text>
                </View>
                <View style={[styles.detailRow, { borderBottomWidth: 0, marginTop: 12 }]}>
                  <Text style={styles.detailTotalLabel}>Cần thanh toán</Text>
                  <Text style={styles.detailTotalValue}>{activeSession.amount.toLocaleString()}đ</Text>
                </View>

                {activeSession.status === 'Parking' && !activeSession.isMonthlyCard && (
                  <View style={styles.statusActionBox}>
                    <Text style={styles.statusWarningText}>⚠️ Trạng thái: Chưa yêu cầu xuất bến. Hãy nhấn nút bên dưới để chốt giờ ra và tính tiền.</Text>
                    <TouchableOpacity style={styles.requestCheckoutBtn} onPress={handleRequestCheckout}>
                      <Text style={styles.requestCheckoutBtnText}>Yêu Cầu Check-out & Tạo QR</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {activeSession.status === 'PendingPayment' && qrCodeData && (
                  <View style={styles.qrPaymentBox}>
                    <Text style={styles.qrBoxTitle}>QUÉT QR CHUYỂN KHOẢN ĐỊNH DANH</Text>
                    <View style={styles.qrWrapper}>
                      <Image 
                        style={styles.qrImage}
                        source={{ uri: qrCodeData }}
                      />
                    </View>
                    <Text style={styles.qrDescription}>Nội dung chuyển khoản đã được mã hóa tự động để kích hoạt mở barrier tức thời.</Text>
                    
                    <TouchableOpacity style={styles.confirmPaymentBtn} onPress={handleConfirmPayment}>
                      <Text style={styles.confirmPaymentBtnText}>Xác Nhận Đã Thanh Toán Thành Công</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {paymentSuccess && (
                  <View style={styles.paymentSuccessAlertBox}>
                    <Text style={styles.paymentSuccessAlertText}>🎉 Hệ thống đã ghi nhận thanh toán thành công. Barrier đang mở, xin mời xe di chuyển ra.</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* TAB 2: THẺ THÁNG */}
        {currentTab === 'monthly' && (
          <View>
            {monthlyCard ? (
              <View style={styles.creditCardBox}>
                <View style={styles.creditCardHeader}>
                  <Text style={styles.creditCardBrand}>NEXUS MEMBER CARD</Text>
                  <Text style={styles.creditCardIcon}>⚡</Text>
                </View>
                <Text style={styles.creditCardCardNum}>{monthlyCard.cardNumber.substring(0, 4)} {monthlyCard.cardNumber.substring(4, 8)} {monthlyCard.cardNumber.substring(8, 12) || '0000'}</Text>
                
                <View style={styles.creditCardFooter}>
                  <View>
                    <Text style={styles.creditCardLabel}>CHỦ THẺ</Text>
                    <Text style={styles.creditCardVal}>{monthlyCard.ownerName.toUpperCase()}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.creditCardLabel}>BIỂN SỐ / HẠN DÙNG</Text>
                    <Text style={styles.creditCardVal}>{monthlyCard.licensePlate} | {monthlyCard.expiryDate}</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.contentCard}>
                <Text style={styles.contentCardTitle}>Đăng ký Thẻ đỗ xe tháng mới</Text>
                <Text style={styles.cardEmptyDescription}>Hiện tại biển số xe của bạn (<strong>{user.licensePlate}</strong>) chưa đăng ký gói thẻ tháng.</Text>
                <Text style={styles.cardEmptyDescription}>Đăng ký thẻ tháng giúp bạn tiết kiệm chi phí đỗ đỗ xe trọn gói và được hưởng đặc quyền miễn phí lượt đỗ ra vào bãi.</Text>

                <Text style={styles.formInputLabel}>Lựa chọn gói đỗ xe tháng</Text>
                <View style={styles.packageSelectGrid}>
                  <TouchableOpacity 
                    style={[styles.packageSelectBtn, monthlyForm.type === 'xang' && styles.packageSelectBtnActive]}
                    onPress={() => setMonthlyForm({ type: 'xang' })}
                  >
                    <Text style={[styles.packageSelectTitle, monthlyForm.type === 'xang' && styles.packageSelectTitleActive]}>Gói Xe Xăng</Text>
                    <Text style={styles.packageSelectPrice}>150.000đ/tháng</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.packageSelectBtn, monthlyForm.type === 'dien' && styles.packageSelectBtnActive]}
                    onPress={() => setMonthlyForm({ type: 'dien' })}
                  >
                    <Text style={[styles.packageSelectTitle, monthlyForm.type === 'dien' && styles.packageSelectTitleActive]}>Gói Xe Điện</Text>
                    <Text style={styles.packageSelectPrice}>200.000đ/tháng</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.infoSummaryBox}>
                  <Text style={styles.summaryItem}>• Họ tên chủ thẻ: {user.name}</Text>
                  <Text style={styles.summaryItem}>• Số điện thoại: {user.phone}</Text>
                  <Text style={styles.summaryItem}>• Biển kiểm soát: {user.licensePlate}</Text>
                </View>

                <TouchableOpacity style={styles.buttonPrimary} onPress={handleRegisterMonthly}>
                  <Text style={styles.buttonText}>Xác Nhận Đăng Ký Gói Tháng</Text>
                </TouchableOpacity>
              </View>
            )}

            {monthlyCard && (
              <View style={styles.contentCard}>
                <Text style={styles.contentCardTitle}>Thông tin thẻ thành viên</Text>
                <View style={styles.infoSummaryBox}>
                  <Text style={styles.summaryItem}>• Mã số thẻ: {monthlyCard.cardNumber}</Text>
                  <Text style={styles.summaryItem}>• Tên chủ xe: {monthlyCard.ownerName}</Text>
                  <Text style={styles.summaryItem}>• Số điện thoại: {monthlyCard.phone}</Text>
                  <Text style={styles.summaryItem}>• Biển kiểm soát: {monthlyCard.licensePlate}</Text>
                  <Text style={styles.summaryItem}>• Gói đăng ký: {monthlyCard.type === 'dien' ? 'Xe Điện sạc ⚡' : 'Xe Xăng ⛽'}</Text>
                  <Text style={styles.summaryItem}>• Hạn sử dụng: {monthlyCard.expiryDate}</Text>
                </View>
                <View style={styles.paymentSuccessAlertBox}>
                  <Text style={styles.paymentSuccessAlertText}>Thẻ tháng của bạn đang hoạt động bình thường. Khi check-in, hệ thống AI sẽ tự nhận dạng biển số và mở rào miễn phí khi xe ra.</Text>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // MÀN HÌNH ĐĂNG NHẬP / ĐĂNG KÝ
  authContainer: {
    flex: 1,
    backgroundColor: '#cbd5e1',
  },
  authScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  authCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: 'rgba(26, 115, 232, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 32,
  },
  authTitle: {
    fontFamily: 'GoogleSansFlex',
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: 1,
    marginBottom: 6,
  },
  authSubtitle: {
    fontFamily: 'GoogleSansFlex',
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '500',
  },
  inputLabel: {
    fontFamily: 'GoogleSansFlex',
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
    marginTop: 12,
  },
  textInput: {
    fontFamily: 'GoogleSansFlex',
    width: '100%',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 16,
  },
  authBtn: {
    backgroundColor: '#1a73e8',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  authBtnText: {
    fontFamily: 'GoogleSansFlex',
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  switchAuthLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchAuthText: {
    fontFamily: 'GoogleSansFlex',
    fontSize: 13,
    color: '#1a73e8',
    fontWeight: '600',
  },

  // GIAO DIỆN CHÍNH APP
  appHeader: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeText: {
    fontFamily: 'GoogleSansFlex',
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  userNameText: {
    fontFamily: 'GoogleSansFlex',
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 2,
  },
  headerRightBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotGreen: {
    backgroundColor: '#28a745',
  },
  dotRed: {
    backgroundColor: '#dc3545',
  },
  statusText: {
    fontFamily: 'GoogleSansFlex',
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  logoutIconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(220, 53, 69, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    fontSize: 16,
  },

  // TAB SELECTOR
  appTabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  appTabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  appTabBtnActive: {
    borderBottomColor: '#1a73e8',
  },
  appTabText: {
    fontFamily: 'GoogleSansFlex',
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  appTabTextActive: {
    color: '#1a73e8',
  },
  appScroll: {
    padding: 16,
  },
  globalLoader: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // CARD CONTENT
  contentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 2,
    elevation: 1,
  },
  contentCardTitle: {
    fontFamily: 'GoogleSansFlex',
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
  },
  formInputLabel: {
    fontFamily: 'GoogleSansFlex',
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  searchBtn: {
    backgroundColor: '#1a73e8',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
  },
  searchBtnText: {
    fontFamily: 'GoogleSansFlex',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  quickSelfSearchBtn: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(26,115,232,0.06)',
    alignItems: 'center',
  },
  quickSelfSearchText: {
    fontFamily: 'GoogleSansFlex',
    fontSize: 12,
    color: '#1a73e8',
    fontWeight: '700',
  },

  // PHIÊN ĐỖ XE CHI TIẾT
  faceVerificationCard: {
    height: 100,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  faceVerifyText: {
    fontFamily: 'GoogleSansFlex',
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailLabel: {
    fontFamily: 'GoogleSansFlex',
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  detailValue: {
    fontFamily: 'GoogleSansFlex',
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '600',
    textAlign: 'right',
  },
  detailValueDetail: {
    fontFamily: 'GoogleSansFlex',
    fontSize: 12,
    color: '#64748b',
    textAlign: 'right',
    maxWidth: '60%',
  },
  detailTotalLabel: {
    fontFamily: 'GoogleSansFlex',
    fontSize: 15,
    fontWeight: '700',
    color: '#dc3545',
  },
  detailTotalValue: {
    fontFamily: 'GoogleSansFlex',
    fontSize: 18,
    fontWeight: '800',
    color: '#dc3545',
  },
  statusActionBox: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  statusWarningText: {
    fontFamily: 'GoogleSansFlex',
    fontSize: 11,
    color: '#d97706',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500',
  },
  requestCheckoutBtn: {
    backgroundColor: '#d97706',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  requestCheckoutBtnText: {
    fontFamily: 'GoogleSansFlex',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  qrPaymentBox: {
    marginTop: 20,
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  qrBoxTitle: {
    fontFamily: 'GoogleSansFlex',
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  qrImage: {
    width: 160,
    height: 160,
    borderRadius: 6,
  },
  qrDescription: {
    fontFamily: 'GoogleSansFlex',
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
    lineHeight: 16,
  },
  confirmPaymentBtn: {
    backgroundColor: '#28a745',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  confirmPaymentBtnText: {
    fontFamily: 'GoogleSansFlex',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  paymentSuccessAlertBox: {
    backgroundColor: 'rgba(40, 167, 69, 0.08)',
    borderColor: 'rgba(40, 167, 69, 0.15)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginTop: 16,
  },
  paymentSuccessAlertText: {
    fontFamily: 'GoogleSansFlex',
    color: '#137333',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
  },

  // THẺ THÁNG CREDIT CARD STYLE
  creditCardBox: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundGradient: 'vertical',
    backgroundColor: '#1e293b',
    padding: 24,
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  creditCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creditCardBrand: {
    fontFamily: 'GoogleSansFlex',
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  creditCardIcon: {
    fontSize: 20,
    color: '#ffc107',
  },
  creditCardCardNum: {
    fontFamily: 'GoogleSansFlex',
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 2,
    marginVertical: 15,
  },
  creditCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  creditCardLabel: {
    fontFamily: 'GoogleSansFlex',
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '600',
    marginBottom: 4,
  },
  creditCardVal: {
    fontFamily: 'GoogleSansFlex',
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },

  // GIA HẠN THẺ THÁNG FORM
  cardEmptyDescription: {
    fontFamily: 'GoogleSansFlex',
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  packageSelectGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  packageSelectBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  packageSelectBtnActive: {
    borderColor: '#1a73e8',
    backgroundColor: 'rgba(26,115,232,0.04)',
  },
  packageSelectTitle: {
    fontFamily: 'GoogleSansFlex',
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  packageSelectTitleActive: {
    color: '#1a73e8',
    fontWeight: '700',
  },
  packageSelectPrice: {
    fontFamily: 'GoogleSansFlex',
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },
  infoSummaryBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryItem: {
    fontFamily: 'GoogleSansFlex',
    fontSize: 13,
    color: '#475569',
    marginBottom: 6,
    fontWeight: '500',
  },
  buttonPrimary: {
    backgroundColor: '#1a73e8',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'GoogleSansFlex',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  }
});
