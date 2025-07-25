import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Manager.css';

function CustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const token = localStorage.getItem('token');

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data);
    } catch {
      alert('Không thể tải khách hàng');
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/customers`, {
        name, address
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setName(''); setAddress(''); fetchCustomers();
    } catch {
      alert('Lỗi khi thêm khách hàng');
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
