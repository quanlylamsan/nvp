// src/pages/UnauthorizedPage.jsx
import React from 'react';

const UnauthorizedPage = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Báo lỗi - Phân quyền truy cập!</h1>
      <p>Bạn không được phép truy cập vào trang này.</p>
      <a href="/nvp/login">Quay lại trang đăng nhập</a>
    </div>
  );
};

export default UnauthorizedPage;
