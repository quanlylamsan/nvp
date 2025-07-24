import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Manager.css';

function UserListPage() {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [editingUser, setEditingUser] = useState(null); // State để lưu người dùng đang chỉnh sửa
  const token = localStorage.getItem('token');

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (error) {
      alert('Không thể tải danh sách người dùng: ' + (error.response?.data?.message || error.message));
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_APP_URL}/api/users`, {
        email, password, role
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmail(''); setPassword(''); setRole('staff');
      fetchUsers();
      alert('Thêm người dùng thành công!');
    } catch (error) {
      alert('Lỗi khi thêm người dùng: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEmail(user.email);
    setPassword(''); // Mật khẩu không được hiển thị để chỉnh sửa trực tiếp
    setRole(user.role);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const updateData = { email, role };
      if (password) { // Chỉ gửi mật khẩu nếu có sự thay đổi
        updateData.password = password;
      }

      await axios.put(`${process.env.REACT_APP_API_URL}/api/users/${editingUser._id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingUser(null);
      setEmail(''); setPassword(''); setRole('staff');
      fetchUsers();
      alert('Cập nhật người dùng thành công!');
    } catch (error) {
      alert('Lỗi khi cập nhật người dùng: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchUsers();
        alert('Xóa người dùng thành công!');
      } catch (error) {
        alert('Lỗi khi xóa người dùng: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <div className="manager-container">
      <h2>👤 Quản lý người dùng</h2>
      
      {/* Form thêm hoặc chỉnh sửa người dùng */}
      <form onSubmit={editingUser ? handleUpdateUser : handleAddUser}>
        <h3>{editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</h3>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input 
          type="password" 
          placeholder={editingUser ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"} 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required={!editingUser} // Bắt buộc nhập khi thêm mới, không bắt buộc khi chỉnh sửa
        />
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="staff">Nhân viên</option>
          <option value="admin">Quản trị viên</option>
        </select>
        <button type="submit">{editingUser ? 'Cập nhật người dùng' : '➕ Thêm người dùng'}</button>
        {editingUser && (
          <button type="button" onClick={() => {
            setEditingUser(null);
            setEmail(''); setPassword(''); setRole('staff');
          }}>Hủy bỏ</button>
        )}
      </form>

      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Vai trò</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button onClick={() => handleEditClick(u)}>Sửa</button>
                <button onClick={() => handleDeleteUser(u._id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserListPage;