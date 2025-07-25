import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/users/login', {
        email,
        password
      });

      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'admin') navigate('/admin');
      else navigate('/store');
    } catch (err) {
      alert(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Đăng nhập hệ thống</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required /><br /><br />
        <input type="password" placeholder="Mật khẩu" value={password}
          onChange={(e) => setPassword(e.target.value)} required /><br /><br />
        <button type="submit">Đăng nhập</button>
      </form>
    </div>
  );
};

export default LoginPage;
