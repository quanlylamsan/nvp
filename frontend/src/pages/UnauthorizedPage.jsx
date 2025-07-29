import React from 'react';

const UnauthorizedPage = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>403 - Không có quyền truy cập</h1>
      <p>Bạn không có quyền để truy cập vào trang này.</p>
    </div>
  );
};

export default UnauthorizedPage;
