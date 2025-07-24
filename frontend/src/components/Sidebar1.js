
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="w-64 bg-green-700 text-white h-screen p-4">
      <div className="font-bold text-lg mb-4">Thông tin cơ sở nuôi</div>
      <ul>
        <li className="mb-2 bg-green-600 p-2 rounded">
          <Link to="/khai-bao">➤ Khai báo cơ sở nuôi</Link>
        </li>
        <li className="mb-2 bg-green-600 p-2 rounded">
          <Link to="/">➤ Quản lý danh sách cơ sở nuôi</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
