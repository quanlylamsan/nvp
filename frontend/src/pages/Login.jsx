import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post('/api/auth/login', form);
      const token = res.data.token;
      localStorage.setItem('token', token);
      setToken(token);
      navigate('/admin/users');
    } catch (err) {
      setError('Đăng nhập thất bại');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">🔐 Đăng nhập</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <input
          type="email"
          placeholder="E-mail"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border p-2 mb-3 rounded"
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full border p-2 mb-4 rounded"
        />
        <button
          onClick={handleLogin}
          className="bg-indigo-600 text-white w-full py-2 rounded"
        >
          Đăng nhập
        </button>
      </div>
    </div>
  );
}
