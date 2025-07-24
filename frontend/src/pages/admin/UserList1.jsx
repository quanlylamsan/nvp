import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' });
  const [currentRole, setCurrentRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwt_decode(token);
      setCurrentRole(decoded.role || '');
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách người dùng:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    try {
      await axios.delete(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchUsers();
    } catch (err) {
      console.error('Lỗi khi xóa:', err);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user._id);
    setForm({
      name: user.name || '',
      email: user.email,
      role: user.role,
    });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`/api/users/${editingUser}`, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error('Lỗi khi cập nhật:', err);
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post('/api/users', form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setForm({ name: '', email: '', password: '', role: 'staff' });
      fetchUsers();
    } catch (err) {
      console.error('Lỗi khi tạo người dùng:', err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">👤 Quản lý người dùng</h2>
      <p className="mb-2 text-sm text-gray-600">
        Vai trò hiện tại: <strong>{currentRole || '...'}</strong>
      </p>

      <div className="flex items-center space-x-2 mb-4">
        <input
          type="email"
          placeholder="E-mail"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border px-3 py-2 rounded"
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="border px-3 py-2 rounded"
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="border px-3 py-2 rounded"
        >
          <option value="staff">Nhân viên</option>
          <option value="admin">Quản trị viên</option>
        </select>
        <button
          onClick={handleCreate}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          ➕ Thêm người dùng
        </button>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">E-mail</th>
            <th className="p-2 border">Vai trò</th>
            <th className="p-2 border">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td className="border p-2">{u.email}</td>
              <td className="border p-2">
                {u.role === 'admin' ? 'quản trị viên' : 'nhân viên'}
              </td>
              <td className="border p-2 space-x-2">
                {currentRole === 'admin' ? (
                  <>
                    <button
                      onClick={() => handleEdit(u)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(u._id)}
                      className="bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Xóa
                    </button>
                  </>
                ) : (
                  <span className="text-gray-400 italic">Không có quyền</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingUser && (
        <div className="mt-6 bg-gray-100 p-4 rounded">
          <h3 className="text-lg font-bold mb-2">✏️ Chỉnh sửa người dùng</h3>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Tên"
            className="border p-2 mr-2 mb-2"
          />
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
            className="border p-2 mr-2 mb-2"
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="border p-2 mr-2 mb-2"
          >
            <option value="staff">Nhân viên</option>
            <option value="admin">Quản trị viên</option>
          </select>
          <button
            onClick={handleUpdate}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Cập nhật
          </button>
        </div>
      )}
    </div>
  );
}
