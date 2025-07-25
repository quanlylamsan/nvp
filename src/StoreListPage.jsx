import React from 'react';

const stores = Array.from({ length: 10 }, (_, i) => ({
  name: 'Cơ sở ' + (i + 1),
  province: 'Tỉnh A',
  ward: 'Phường B',
  address: 'Phường B, Tỉnh A',
  owner: 'Nguyễn Văn A',
  phone: '0123456789',
  active: i % 2 === 0
}));

const StoreListPage = () => {
  return (
    <div className="overflow-x-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-green-700">📋 Danh sách cơ sở</h2>
      <table className="min-w-full table-auto border text-sm border-gray-300">
        <thead className="bg-green-100 text-gray-800">
          <tr>
            <th className="px-3 py-2 border">STT</th>
            <th className="px-3 py-2 border">Tên cơ sở</th>
            <th className="px-3 py-2 border">Địa chỉ</th>
            <th className="px-3 py-2 border">Người đại diện</th>
            <th className="px-3 py-2 border">SĐT</th>
            <th className="px-3 py-2 border">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((s, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-3 py-2 border text-center">{i + 1}</td>
              <td className="px-3 py-2 border">{s.name}</td>
              <td className="px-3 py-2 border">{s.address}</td>
              <td className="px-3 py-2 border">{s.owner}</td>
              <td className="px-3 py-2 border">{s.phone}</td>
              <td className="px-3 py-2 border">
                <span className={`px-2 py-1 text-xs rounded text-white ${
                  s.active ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {s.active ? 'Đang hoạt động' : 'Ngưng'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StoreListPage;
