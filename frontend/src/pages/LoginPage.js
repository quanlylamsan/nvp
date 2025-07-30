import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

function LoginPage() {
  const { setAuthStatus } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      // === THAY ĐỔI CHÍNH Ở ĐÂY ===
      // Backend trả về { token, role }, không có đối tượng user.
      // Vì vậy, chúng ta lấy `token` và `role` trực tiếp từ `response.data`.
      const { token, role } = response.data;

      // Cập nhật trạng thái đăng nhập vào context với đúng dữ liệu
      setAuthStatus({
        isLoggedIn: true,
        user: { role: role }, // Tạo một đối tượng user đơn giản nếu cần
        role: role,           // Dùng trực tiếp biến role vừa lấy được
        token: token,
      });
      // === KẾT THÚC THAY ĐỔI ===

      // Lưu vào localStorage nếu người dùng chọn ghi nhớ
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberedPassword', password);
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
      }

      // Điều hướng sau khi đăng nhập thành công
      navigate('/dashboard');

    } catch (err) {
      // Bây giờ, khối catch này sẽ chỉ chạy khi có lỗi thật sự từ server
      // hoặc lỗi mạng, thay vì lỗi JavaScript do xử lý sai dữ liệu.
      console.error('Lỗi đăng nhập:', err);
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">Đăng nhập</h2>
        {error && <p className="login-error-message">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="login-form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="login-form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="login-remember-me">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe">Ghi nhớ tài khoản</label>
          </div>
          <button type="submit" className="login-button">Đăng nhập</button>
        </form>
        <div className="login-software-info" translate="no">
          Phiên bản 1.0.0<br />
          &copy;2025 Nguyen Van Phuc - 0358.758.358<br />
          Email: phuc88.klvn@gmail.com
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
