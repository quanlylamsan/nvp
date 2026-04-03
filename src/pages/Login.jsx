import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Định nghĩa URL của backend để dễ quản lý
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Xóa lỗi cũ khi người dùng thử lại

    try {
      // ✅ SỬA LỖI TẠI ĐÂY: Thêm API_BASE_URL vào trước đường dẫn
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      
      const token = res.data.token;
      
      // Kiểm tra xem có nhận được token không
      if (token) {
        login(token); // Lưu token vào context (và localStorage)
        navigate('/khai-bao-co-so'); // Chuyển hướng đến trang chính sau khi đăng nhập
      } else {
        setError('Không nhận được token từ server.');
      }

    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      // Hiển thị thông báo lỗi từ server nếu có
      setError(err.response?.data?.message || 'Email hoặc mật khẩu không chính xác.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">Đăng Nhập Hệ Thống</h2>
        
        {error && (
          <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nhapemail@example.com"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
}