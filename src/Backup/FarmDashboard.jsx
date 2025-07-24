import React from 'react';
import StoreListPage from './StoreListPage';
import FarmDashboard from './FarmDashboard';


const FarmDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4 hidden md:block">
        <h2 className="text-xl font-bold mb-4 text-green-600">🌾 Quản lý Farm</h2>
        <nav className="space-y-2">
          <a href="#" className="block px-3 py-2 rounded hover:bg-green-100 text-gray-700">Dashboard</a>
          <a href="#" className="block px-3 py-2 rounded hover:bg-green-100 text-gray-700">Cửa hàng</a>
          <a href="#" className="block px-3 py-2 rounded hover:bg-green-100 text-gray-700">Báo cáo</a>
          <a href="#" className="block px-3 py-2 rounded hover:bg-green-100 text-gray-700">Tài khoản</a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        {/* Header */}
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">📊 Thống kê tổng quan</h1>
          <div className="text-sm text-gray-500">{new Date().toLocaleDateString()}</div>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Tổng số cơ sở</div>
            <div className="text-2xl font-bold text-green-600">256</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Đang hoạt động</div>
            <div className="text-2xl font-bold text-green-600">218</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Tạm ngưng</div>
            <div className="text-2xl font-bold text-red-500">38</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Diện tích (m²)</div>
            <div className="text-2xl font-bold text-blue-500">12,540</div>
          </div>
        </div>

        {/* Store list component */}
        <StoreListPage />
      </main>
    </div>
  );
};

export default FarmDashboard;
