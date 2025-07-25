import React from 'react';
import Sidebar from './Sidebar';

function Dashboard() {
  const role = localStorage.getItem('role');

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <h2>🎯 Dashboard</h2>
        <p>Xin chào, bạn đang đăng nhập với quyền: <strong>{role}</strong></p>
        {role === 'admin' ? (
          <p>🛠 Bạn có quyền quản trị toàn hệ thống.</p>
        ) : (
          <p>📋 Bạn có thể khai báo và xem dữ liệu cơ bản.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
