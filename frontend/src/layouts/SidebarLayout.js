import React from "react";
import { Outlet, Link } from "react-router-dom";

export default function SidebarLayout() {
  return (
    <div style={{ display: "flex" }}>
      <aside style={{ width: 200, background: "#2e7d32", color: "#fff", padding: 20 }}>
        <h3>Thông tin cơ sở nuôi</h3>
        <nav>
          <Link to="/admin" style={{ display: "block", color: "#fff", margin: "10px 0" }}>Dashboard</Link>
          <Link to="/admin/stores" style={{ display: "block", color: "#fff", margin: "10px 0" }}>Danh sách cơ sở</Link>
          <Link to="/logout" style={{ display: "block", color: "#fff", marginTop: 20 }}>Đăng xuất</Link>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: 20 }}>
        <Outlet />
      </main>
    </div>
  );
}
