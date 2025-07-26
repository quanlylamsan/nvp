// src/pages/CustomerListPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Manager.css';

// ✅ THÊM DÒNG NÀY: Lấy URL API từ biến môi trường
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

function CustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const token = localStorage.getItem('token');

  const fetchCustomers = async () => {
    try {
      // ✅ SỬ DỤNG API_BASE_URL
      const res = await axios.get(`${API_BASE_URL}/api/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data);
    } catch (error) { // Thêm `error` vào catch
      alert('Không thể tải khách hàng: ' + (error.response?.data?.message || error.message)); // Thông báo lỗi chi tiết hơn
    }
  };

  useEffect(() => { 
    if (token) { // Chỉ fetch nếu có token
      fetchCustomers(); 
    } else {
      // Optional: navigate to login if no token
    }
  }, [token]); // Thêm token vào dependency array

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      // ✅ SỬ DỤNG API_BASE_URL
      await axios.post(`${API_BASE_URL}/api/customers`, {
        name, address
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setName(''); setAddress(''); fetchCustomers();
      alert('Thêm khách hàng thành công!'); // Thêm thông báo thành công
    } catch (error) { // Thêm `error` vào catch
      alert('Lỗi khi thêm khách hàng: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="manager-container">
      <h2>🏢 Quản lý khách hàng</h2>
      <form onSubmit={handleAddCustomer}>
        <input type="text" placeholder="Tên" value={name} onChange={e => setName(e.target.value)} required />
        <input type="text" placeholder="Địa chỉ" value={address} onChange={e => setAddress(e.target.value)} required />
        <button type="submit">➕ Thêm khách hàng</button>
      </form>

      <table>
        <thead>
          <tr><th>Tên</th><th>Địa chỉ</th></tr>
        </thead>
        <tbody>
          {customers.map(c => (
            <tr key={c._id}>
              <td>{c.name}</td>
              <td>{c.address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CustomerListPage;