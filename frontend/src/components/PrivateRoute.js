import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Sử dụng hook useAuth

const PrivateRoute = ({ children, allowedRoles }) => {
  const { isLoggedIn, role } = useAuth();
  const location = useLocation();

  // 1. Kiểm tra xem người dùng đã đăng nhập chưa
  if (!isLoggedIn) {
    // Nếu chưa, chuyển hướng về trang đăng nhập
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Kiểm tra xem vai trò của người dùng có được phép truy cập không
  // So sánh vai trò của người dùng (auth.role) với danh sách vai trò được phép (allowedRoles)
  if (!allowedRoles.includes(role)) {
    // Nếu không có quyền, chuyển hướng đến trang "Unauthorized"
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // 3. Nếu đã đăng nhập và có quyền, cho phép hiển thị trang
  return children;
};

export default PrivateRoute;
