import React, { useState, useEffect } from 'react';
import api from '../api'; // ✅ Sử dụng 'api' đã được cấu hình
import './Manager.css';
àasfasfasfas
function UserListPage() {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/users'); // Không cần header
      setUsers(res.data);
    } catch (error) {
      alert('Không thể tải danh sách người dùng: ' + (error.response?.data?.message || error.message));
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const resetForm = () => {
    setEditingUser(null);
    setEmail('');
    setPassword('');
    setRole('staff');
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      // ✅ Đã sửa lỗi URL và sử dụng 'api'
      await api.post('/api/users', { email, password, role });
      resetForm();
      fetchUsers();
      alert('Thêm người dùng thành công!');
    } catch (error) {
      alert('Lỗi khi thêm người dùng: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEmail(user.email);
    setPassword('');
    setRole(user.role);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const updateData = { email, role };
      if (password) {
        updateData.password = password;
      }
      await api.put(`/api/users/${editingUser._id}`, updateData);
      resetForm();
      fetchUsers();
      alert('Cập nhật người dùng thành công!');
    } catch (error) {
      alert('Lỗi khi cập nhật người dùng: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await api.delete(`/api/users/${userId}`);
        fetchUsers();
        alert('Xóa người dùng thành công!');
      } catch (error) {
        alert('Lỗi khi xóa người dùng: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  // Phần JSX giữ nguyên không thay đổi
  return (
    <div className="manager-container">
      <h2>👤 Quản lý người dùng</h2>
      
      <form onSubmit={editingUser ? handleUpdateUser : handleAddUser}>
        <h3>{editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</h3>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input 
          type="password" 
          placeholder={editingUser ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"} 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required={!editingUser}
        />
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="staff">Nhân viên</option>
          <option value="admin">Quản trị viên</option>
        </select>
        <button type="submit">{editingUser ? 'Cập nhật người dùng' : '➕ Thêm người dùng'}</button>
        {editingUser && (
          <button type="button" onClick={resetForm}>Hủy bỏ</button>
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