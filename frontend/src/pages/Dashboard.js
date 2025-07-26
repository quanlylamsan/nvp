// C:\Users\phuc8\Desktop\wildlife-frontend\frontend\src\pages\Dashboard.js

import React from 'react';
import '../Dashboard.css'; // Giữ lại import CSS này cho style của Dashboard

function Dashboard() {
  return (
    <div className="main-content"> {/* Giữ lại main-content cho nội dung chính của dashboard */}
      {/* Nội dung chính của Dashboard */}
      <div className="dashboard-body">
        <p>Chào mừng bạn đến với hệ thống quản lý lâm sản!</p>
        {/* Bạn có thể đặt các thành phần khác của dashboard tại đây */}
        {/* Ví dụ: Các card thông tin, biểu đồ, nút bấm */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginTop: '30px'
        }}>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '25px',
            borderRadius: 'var(--border-radius)',
            boxShadow: '0 2px 8px var(--shadow-light)',
            textAlign: 'center'
          }}>
            <h3>Tổng số cơ sở</h3>
            <p style={{ fontSize: '2.5em', fontWeight: 'bold', color: 'var(--primary-color)' }}>125</p>
            <p>Cơ sở đang hoạt động</p>
          </div>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '25px',
            borderRadius: 'var(--border-radius)',
            boxShadow: '0 2px 8px var(--shadow-light)',
            textAlign: 'center'
          }}>
            <h3>Loài phổ biến</h3>
            <p style={{ fontSize: '1.8em', fontWeight: 'bold', color: 'var(--text-dark)' }}>Rắn hổ mang</p>
            <p>Loài được nuôi nhiều nhất</p>
          </div>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '25px',
            borderRadius: 'var(--border-radius)',
            boxShadow: '0 2px 8px var(--shadow-light)',
            textAlign: 'center'
          }}>
            <h3>Báo cáo mới</h3>
            <p style={{ fontSize: '1.2em', fontWeight: 'bold', color: 'var(--text-dark)' }}>25</p>
            <p>Báo cáo chờ duyệt</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;