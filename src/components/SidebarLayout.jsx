// src/components/SidebarLayout.jsx
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './SidebarLayout.css';

const SidebarLayout = () => {
  const location = useLocation();

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>🌐 Quản lý</h2>
        <nav>
          <Link className={location.pathname === "/admin" ? "active" : ""} to="/admin">Dashboard</Link>
          <Link to="/admin/stores">Cửa hàng</Link>
          <Link to="/admin/users">Tài khoản</Link>
          <Link to="/logout">Đăng xuất</Link>


        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default SidebarLayout;
