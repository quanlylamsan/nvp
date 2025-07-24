
import React from 'react';

const DanhSachCoSo = () => {
  return (
    <div className="p-4 w-full">
      <h1 className="text-2xl font-bold text-green-800 mb-4">Quản lý danh sách cơ sở nuôi</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        <select className="border p-2 rounded">
          <option>Tỉnh Đồng Tháp</option>
        </select>
        <input placeholder="Tìm kiếm..." className="border p-2 rounded" />
      </div>

      <table className="w-full table-auto border border-gray-300 text-sm">
        <thead className="bg-green-500 text-white">
          <tr>
            <th className="border p-2">TT</th>
            <th className="border p-2">Thao tác</th>
            <th className="border p-2">Mã hệ thống</th>
            <th className="border p-2">Tỉnh</th>
            <th className="border p-2">Huyện</th>
            <th className="border p-2">Xã</th>
            <th className="border p-2">Cơ sở nuôi</th>
            <th className="border p-2">SĐT</th>
            <th className="border p-2">Người đại diện</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2 text-center">1</td>
            <td className="border p-2 text-blue-600">Chi tiết ✎ | 🗑️</td>
            <td className="border p-2">87.873.00125</td>
            <td className="border p-2">Tỉnh Đồng Tháp</td>
            <td className="border p-2">Huyện Cao Lãnh</td>
            <td className="border p-2">Thị trấn Mỹ Thọ</td>
            <td className="border p-2">Bùi Minh Cần</td>
            <td className="border p-2">0918055227</td>
            <td className="border p-2">Bùi Minh Cần</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DanhSachCoSo;
