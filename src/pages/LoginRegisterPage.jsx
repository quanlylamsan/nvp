import React, { useState } from 'react';
import axios from 'axios';

const LoginRegisterPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: '', password: '', name: '' });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const url = isLogin ? '/api/users/login' : '/api/users/register';

    try {
      const res = await axios.post(url, form);
      if (isLogin) {
        alert('✅ Đăng nhập thành công');
        localStorage.setItem('token', res.data.token);
      } else {
        alert('✅ Đăng ký thành công');
        setIsLogin(true);
      }
    } catch (err) {
      alert('❌ ' + (err?.response?.data?.message || 'Lỗi không xác định'));
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>{isLogin ? '🔐 Đăng nhập' : '📝 Đăng ký'}</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div>
            <label>Tên:</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required />
          </div>
        )}
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div>
          <label>Mật khẩu:</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </div>
        <button type="submit" style={{ marginTop: 10 }}>
          {isLogin ? 'Đăng nhập' : 'Đăng ký'}
        </button>
      </form>
      <p style={{ marginTop: 10 }}>
        {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
        <button onClick={() => setIsLogin(!isLogin)} style={{ color: 'blue', background: 'none', border: 'none' }}>
          {isLogin ? 'Đăng ký' : 'Đăng nhập'}
        </button>
      </p>
    </div>
  );
};

export default LoginRegisterPage;
