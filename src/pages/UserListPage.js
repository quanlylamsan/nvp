import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Manager.css';

function UserListPage() {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const token = localStorage.getItem('token');

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch {
      alert('Không thể tải danh sách người dùng');
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/users`, {
        email, password, role
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmail(''); setPassword(''); setRole('staff'); fetchUsers();
    } catch {
      alert('Lỗi khi thêm người dùng');
    }
  };

  return (
    <div className="manager-container">
      <h2>👤 Quản lý người dùng</h2>
      <form onSubmit={handleAddUser}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Mật khẩu" value={password} onChange={e => setPassword(e.target.value)} required />
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="staff">Nhân viên</option>
          <option value="admin">Quản trị viên</option>
        </select>
        <button type="submit">➕ Thêm người dùng</button>
      </form>

      <table>
        <thead>
          <tr><th>Email</th><th>Vai trò</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.email}</td>
              <td>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserListPage;
