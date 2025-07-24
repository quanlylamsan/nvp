import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './LoginPage.css'; // 👈 Thêm CSS riêng cho giao diện

function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, { email, password });
      const decoded = jwtDecode(res.data.token);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', decoded.role);
      window.location.href = '/dashboard';
    } catch (err) {
      alert('❌ Đăng nhập thất bại');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, { email, password, role });
      alert('✅ Đăng ký thành công!');
      setIsRegister(false);
    } catch (err) {
      alert('❌ Đăng ký thất bại');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isRegister ? 'Đăng ký' : 'Đăng nhập'}</h2>
        <form onSubmit={isRegister ? handleRegister : handleLogin}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Mật khẩu" value={password} onChange={e => setPassword(e.target.value)} required />
          
          {isRegister && (
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="staff">Nhân viên</option>
              <option value="admin">Quản trị viên</option>
            </select>
          )}

          <button type="submit">{isRegister ? 'Đăng ký' : 'Đăng nhập'}</button>
        </form>

        <p className="toggle-text">
          {isRegister ? (
            <>Đã có tài khoản? <span onClick={() => setIsRegister(false)}>Đăng nhập</span></>
          ) : (
            <>Chưa có tài khoản? <span onClick={() => setIsRegister(true)}>Đăng ký</span></>
          )}
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
