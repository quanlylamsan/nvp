import React, { useState, useEffect } from 'react';

const UserForm = ({ onSubmit, initialData = {}, isEditing = false }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'staff',
    province: '',
    communes: [],
    employeeId: ''
  });

  const [newCommune, setNewCommune] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        email: initialData.email || '',
        password: '',
        displayName: initialData.displayName || '',
        role: initialData.role || 'staff',
        province: initialData.province || '',
        communes: initialData.communes || [],
        employeeId: initialData.employeeId || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCommune = () => {
    if (newCommune && !formData.communes.includes(newCommune)) {
      setFormData((prev) => ({
        ...prev,
        communes: [...prev.communes, newCommune]
      }));
      setNewCommune('');
    }
  };

  const handleRemoveCommune = (commune) => {
    setFormData((prev) => ({
      ...prev,
      communes: prev.communes.filter((c) => c !== commune)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
      <div>
        <label className="block font-medium">Email:</label>
        <input
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="border p-2 w-full"
        />
      </div>

      {!isEditing && (
        <div>
          <label className="block font-medium">Mật khẩu:</label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
      )}

      <div>
        <label className="block font-medium">Họ tên:</label>
        <input
          type="text"
          name="displayName"
          value={formData.displayName}
          onChange={handleChange}
          className="border p-2 w-full"
        />
      </div>

      <div>
        <label className="block font-medium">Mã nhân viên:</label>
        <input
          type="text"
          name="employeeId"
          value={formData.employeeId}
          onChange={handleChange}
          className="border p-2 w-full"
        />
      </div>

      <div>
        <label className="block font-medium">Vai trò:</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="border p-2 w-full"
        >
          <option value="admin">Admin</option>
          <option value="manager">Quản lý tỉnh</option>
          <option value="staff">Cán bộ xã</option>
        </select>
      </div>

      {formData.role === 'manager' && (
        <div>
          <label className="block font-medium">Tỉnh quản lý:</label>
          <input
            type="text"
            name="province"
            value={formData.province}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
      )}

      {formData.role === 'staff' && (
        <div>
          <label className="block font-medium">Danh sách xã quản lý:</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newCommune}
              onChange={(e) => setNewCommune(e.target.value)}
              className="border p-2 flex-1"
              placeholder="Nhập tên xã"
            />
            <button type="button" onClick={handleAddCommune} className="bg-blue-500 text-white px-3 py-1 rounded">
              Thêm
            </button>
          </div>
          <ul className="list-disc ml-5">
            {formData.communes.map((commune, index) => (
              <li key={index} className="flex justify-between items-center">
                {commune}
                <button
                  type="button"
                  onClick={() => handleRemoveCommune(commune)}
                  className="text-red-500 ml-2"
                >
                  Xoá
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
        {isEditing ? 'Cập nhật' : 'Tạo mới'}
      </button>
    </form>
  );
};

export default UserForm;
