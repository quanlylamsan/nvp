// src/pages/LoginPage.js
import React, 'useState', useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css'; // Import CSS cho trang đăng nhập

// Lấy URL API từ biến môi trường.
// Nếu không có, nó sẽ mặc định dùng localhost:10000.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000'; 

function LoginPage({ setAuthStatus }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false); // State cho checkbox "Ghi nhớ tài khoản"
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // useEffect để tải thông tin đăng nhập đã lưu khi component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true); // Đặt checkbox là true nếu có thông tin đã lưu
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    console.log('handleLogin function called.');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      const { token, role } = response.data;

      // Gọi hàm setAuthStatus được truyền từ App.js
      setAuthStatus(token, role);

      // Xử lý "Ghi nhớ tài khoản"
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberedPassword', password);
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
      }

      console.log('Token after set (via setAuthStatus):', localStorage.getItem('token'));
      console.log('Role after set (via setAuthStatus):', localStorage.getItem('role'));

      navigate('/dashboard');
      console.log('Navigation to /dashboard attempted.');

    } catch (err) {
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
            <label htmlFor="email" className="login-label">E-mail</label>
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
            <label htmlFor="password" className="login-label">Mật khẩu</label>
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
          Phiên bản 1.0.0 <br />
          &copy;2025Nguyen Van Phuc&copy;0358.758.358&copy;Phuc88.klvn@gmail.com&copy;
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
