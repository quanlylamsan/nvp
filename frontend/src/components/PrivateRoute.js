import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ allowedRoles, children }) => {
  // Bước 1: Lấy đúng đối tượng `auth` lồng bên trong từ context
  const { auth } = useAuth();

  // In ra để kiểm tra, bạn sẽ thấy đối tượng `auth` chứa dữ liệu
  console.log("Dữ liệu auth trong PrivateRoute:", auth);

  // Nếu auth chưa được khởi tạo (trạng thái ban đầu), có thể chuyển về login
  if (!auth || !auth.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Bước 2: Bây giờ mới lấy role từ đối tượng `auth`
  const { role } = auth;

  // Kiểm tra vai trò (đảm bảo `allowedRoles` đã được truyền vào)
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Nếu mọi thứ đều ổn, hiển thị component con
  return children || <Outlet />;
};

export default PrivateRoute;
