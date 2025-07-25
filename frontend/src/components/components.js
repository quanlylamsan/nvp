import React from 'react';

const Sidebar = () => {
  return (
    <div className="w-64 bg-green-700 text-white h-screen p-4">
      <div className="font-bold text-lg mb-4">Thông tin cơ sở nuôi</div>
      <ul>
        <li className="mb-2 bg-green-600 p-2 rounded">➤ Khai báo cơ sở nuôi</li>
        <li className="mb-2 bg-green-600 p-2 rounded">➤ Quản lý danh sách cơ sở nuôi</li>
        <li className="mb-2">➤ Sổ theo dõi ĐVHD</li>
        <li className="mb-2">➤ Thống kê báo cáo</li>
        <li className="mb-2">➤ Quản trị hệ thống</li>
      </ul>
    </div>
  );
};

export default Sidebar;
