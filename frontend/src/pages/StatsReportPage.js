import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

function StatsReportPage() {
  return (
    <div>
      <h1>Trang Báo cáo Thống kê</h1>
      <nav style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <NavLink to="/stats-report/subA" style={{ marginRight: '15px' }}>Báo cáo A</NavLink>
        <NavLink to="/stats-report/subB">Báo cáo B</NavLink>
      </nav>
      
      {/* Outlet là nơi hiển thị nội dung của các trang con */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default StatsReportPage;