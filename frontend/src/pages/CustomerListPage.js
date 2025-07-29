// src/pages/CustomerListPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Manager.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

function CustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [province, setProvince] = useState('');
  const [commune, setCommune] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role'); // ✅ Giả sử bạn đã lưu 'role' khi đăng nhập

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data);
    } catch (error) {
      alert('Không thể tải khách hàng: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCustomers();
    }
  }, [token]);

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/customers`, {
        name, address, province, commune
        // ❗️ Không gửi createdBy — backend sẽ tự lấy từ `req.user.id`
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setName('');
      setAddress('');
      setProvince('');
      setCommune('');
      fetchCustomers();
      alert('Thêm khách hàng thành công!');
    } catch (error) {
      alert('Lỗi khi thêm khách hàng: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="manager-container">
      <h2>🏢 Quản lý khách hàng</h2>
      <form onSubmit={handleAddCustomer}>
        <input type="text" placeholder="Tên" value={name} onChange={e => setName(e.target.value)} required />
        <input type="text" placeholder="Địa chỉ" value={address} onChange={e => setAddress(e.target.value)} required />
        <input type="text" placeholder="Tỉnh" value={province} onChange={e => setProvince(e.target.value)} required />
        <input type="text" placeholder="Xã" value={commune} onChange={e => setCommune(e.target.value)} required />
        <button type="submit">➕ Thêm khách hàng</button>
      </form>

      {loading ? (
        <p>Đang tải danh sách khách hàng...</p>
      ) : customers.length === 0 ? (
        <p>Không có khách hàng nào.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Địa chỉ</th>
              <th>Tỉnh</th>
              <th>Xã</th>
              {role === 'admin' || role === 'manager' ? <th>Nhân viên quản lý</th> : null}
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{c.address}</td>
                <td>{c.province}</td>
                <td>{c.commune}</td>
                {role === 'admin' || role === 'manager' ? (
                  <td>{c.createdBy?.name || 'N/A'}</td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CustomerListPage;
