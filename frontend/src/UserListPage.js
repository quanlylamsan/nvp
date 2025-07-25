import React, { useEffect, useState } from 'react';
import axios from 'axios';

function UserListPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${process.env.REACT_APP_API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setUsers(res.data))
    .catch(err => alert('Bạn không có quyền truy cập'));
  }, []);

  return (
    <div>
      <h2>Danh sách người dùng</h2>
      <ul>
        {users.map(u => (
          <li key={u._id}>{u.email} ({u.role})</li>
        ))}
      </ul>
    </div>
  );
}

export default UserListPage;
