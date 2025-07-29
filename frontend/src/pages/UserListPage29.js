import React, { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';

const UserListPage = () => {
    // --- State của trang ---
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    // --- STATE MỚI CHO FORM VÀ ĐƠN VỊ HÀNH CHÍNH ---
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        displayName: '',
        employeeId: '',
        role: 'Cán bộ xã',
        province: '', // Tỉnh/thành phố (sẽ lưu mã tỉnh)
        communes: [], // Danh sách các xã quản lý (sẽ lưu tên xã)
    });
    const [provinces, setProvinces] = useState([]); // Danh sách tất cả tỉnh
    const [communesList, setCommunesList] = useState([]); // Danh sách xã đã lọc theo tỉnh
    const [selectedCommune, setSelectedCommune] = useState(''); // Xã đang được chọn trong dropdown

    // --- Tải danh sách người dùng ban đầu ---
    const fetchUsers = async () => {
        try {
            const res = await axios.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error('Lỗi khi tải danh sách người dùng:', err);
        }
    };
    useEffect(() => {
        fetchUsers();
    }, []);

    // --- LOGIC MỚI: Tải danh sách tỉnh ---
    // Chạy 1 lần duy nhất khi component được tạo
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                // GIẢ ĐỊNH: Bạn có API này để lấy danh sách tỉnh
                const res = await axios.get('/api/provinces');
                setProvinces(res.data);
            } catch (err) {
                console.error('Lỗi khi tải danh sách tỉnh:', err);
            }
        };
        fetchProvinces();
    }, []);

    // --- LOGIC MỚI: Tải danh sách xã khi tỉnh thay đổi ---
    useEffect(() => {
        const fetchCommunes = async () => {
            // Chỉ chạy khi đã chọn một tỉnh
            if (formData.province) {
                try {
                    // GIẢ ĐỊNH: Bạn có API này để lấy xã theo mã tỉnh
                    const res = await axios.get(`/api/communes?provinceCode=${formData.province}`);
                    setCommunesList(res.data);
                } catch (err) {
                    console.error('Lỗi khi tải danh sách xã:', err);
                    setCommunesList([]);
                }
            } else {
                setCommunesList([]); // Nếu không có tỉnh, danh sách xã rỗng
            }
        };

        fetchCommunes();
    }, [formData.province]); // Phụ thuộc vào tỉnh trong form

    // --- LOGIC MỚI: Điền dữ liệu vào form khi bấm nút "Sửa" ---
    useEffect(() => {
        if (editingUser) {
            setFormData({
                email: editingUser.email || '',
                password: '', // Luôn để trống mật khẩu khi sửa
                displayName: editingUser.displayName || '',
                employeeId: editingUser.employeeId || '',
                role: editingUser.role || 'Cán bộ xã',
                province: editingUser.province || '',
                communes: editingUser.communes || [],
            });
            setIsCreating(false);
        }
    }, [editingUser]);


    // --- CÁC HÀM XỬ LÝ FORM ---
    const resetFormState = () => {
        setFormData({
            email: '',
            password: '',
            displayName: '',
            employeeId: '',
            role: 'Cán bộ xã',
            province: '',
            communes: [],
        });
        setSelectedCommune('');
        setCommunesList([]);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Nếu thay đổi tỉnh, xóa các xã đã chọn trước đó
        if (name === 'province') {
             setFormData((prev) => ({ ...prev, [name]: value, communes: [] }));
        } else {
             setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleAddCommune = () => {
        if (selectedCommune && !formData.communes.includes(selectedCommune)) {
            setFormData(prev => ({ ...prev, communes: [...prev.communes, selectedCommune] }));
            setSelectedCommune(''); // Reset ô chọn
        }
    };

    const handleRemoveCommune = (communeToRemove) => {
        setFormData(prev => ({ ...prev, communes: prev.communes.filter(c => c !== communeToRemove) }));
    };

    // --- CÁC HÀM XỬ LÝ CHÍNH CỦA TRANG (CRUD) ---
    const handleSubmit = async (e) => {
        e.preventDefault(); // Ngăn form submit theo cách truyền thống
        try {
            const dataToSend = { ...formData };
            if (editingUser) {
                // Khi sửa, nếu không nhập mật khẩu mới thì không gửi trường password
                if (!dataToSend.password) {
                    delete dataToSend.password;
                }
                await axios.put(`/users/${editingUser._id}`, dataToSend);
            } else {
                if (!dataToSend.password) {
                    alert('Vui lòng nhập mật khẩu khi tạo người dùng mới.');
                    return;
                }
                await axios.post('/users', dataToSend);
            }
            fetchUsers();
            handleCancel(); // Đóng và reset form
        } catch (err) {
            console.error('Lỗi khi lưu người dùng:', err);
            // Có thể thêm thông báo lỗi cho người dùng ở đây
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xoá người dùng này?')) return;
        try {
            await axios.delete(`/users/${id}`);
            fetchUsers();
        } catch (err) {
            console.error('Lỗi khi xoá người dùng:', err);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user); // Việc này sẽ trigger useEffect để điền form
    };
    
    const handleAddNew = () => {
        setIsCreating(true);
        setEditingUser(null);
        resetFormState();
    };

    const handleCancel = () => {
        setEditingUser(null);
        setIsCreating(false);
        resetFormState();
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Danh sách người dùng</h2>
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={handleAddNew}
                >
                    + Thêm người dùng
                </button>
            </div>

            {/* --- FORM ĐƯỢC TÍCH HỢP TRỰC TIẾP VÀO ĐÂY --- */}
            {(isCreating || editingUser) && (
                <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                    <h3 className="text-xl font-semibold mb-4">
                        {editingUser ? 'Chỉnh sửa người dùng' : 'Tạo người dùng mới'}
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* --- Các trường input cơ bản --- */}
                        <div>
                            <label className="block mb-1 font-medium">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded" required />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Mật khẩu</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-2 border rounded" placeholder={editingUser ? 'Để trống nếu không đổi' : ''} required={!editingUser} />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Họ tên</label>
                            <input type="text" name="displayName" value={formData.displayName} onChange={handleChange} className="w-full p-2 border rounded" required />
                        </div>
                         <div>
                            <label className="block mb-1 font-medium">Mã nhân viên</label>
                            <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Vai trò</label>
                            <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border rounded">
                                <option value="Cán bộ xã">Cán bộ xã</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>

                        {/* --- TRƯỜNG CHỌN TỈNH --- */}
                        <div>
                            <label className="block mb-1 font-medium">Tỉnh/Thành phố</label>
                            <select name="province" value={formData.province} onChange={handleChange} className="w-full p-2 border rounded" required>
                                <option value="">-- Chọn Tỉnh/Thành phố --</option>
                                {provinces.map((p) => (
                                    <option key={p.code} value={p.code}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* --- TRƯỜNG CHỌN XÃ (ĐÃ LỌC) --- */}
                        <div>
                            <label className="block mb-1 font-medium">Danh sách xã quản lý</label>
                            <div className="flex items-center space-x-2">
                                <select
                                    value={selectedCommune}
                                    onChange={(e) => setSelectedCommune(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    disabled={!formData.province}
                                >
                                    <option value="">-- Chọn xã --</option>
                                    {communesList.map((c) => (
                                        <option key={c.code} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                                <button type="button" onClick={handleAddCommune} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" disabled={!selectedCommune}>
                                    Thêm
                                </button>
                            </div>
                            <div className="mt-2 space-x-2">
                                {formData.communes.map(commune => (
                                    <span key={commune} className="inline-flex items-center bg-gray-200 rounded-full px-3 py-1 text-sm">
                                        {commune}
                                        <button type="button" onClick={() => handleRemoveCommune(commune)} className="ml-2 text-red-500 hover:text-red-700">&times;</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 pt-4">
                            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                                {editingUser ? 'Lưu thay đổi' : 'Tạo mới'}
                            </button>
                             <button type="button" onClick={handleCancel} className="text-gray-600 underline">
                                Huỷ
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* --- BẢNG DANH SÁCH NGƯỜI DÙNG --- */}
            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    {/* ... thead của bạn không đổi ... */}
                    <thead>
                        <tr className="bg-gray-200">
                           <th className="p-2 border">Email</th>
                           <th className="p-2 border">Tên</th>
                           <th className="p-2 border">Vai trò</th>
                           <th className="p-2 border">Tỉnh</th>
                           <th className="p-2 border">Xã</th>
                           <th className="p-2 border">Mã NV</th>
                           <th className="p-2 border">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u._id} className="border-t">
                                <td className="p-2 border">{u.email}</td>
                                <td className="p-2 border">{u.displayName}</td>
                                <td className="p-2 border">{u.role}</td>
                                {/* Hiển thị tên tỉnh thay vì mã tỉnh (cần logic ánh xạ nếu cần) */}
                                <td className="p-2 border">{provinces.find(p => p.code === u.province)?.name || u.province || '-'}</td>
                                <td className="p-2 border">{(u.communes || []).join(', ')}</td>
                                <td className="p-2 border">{u.employeeId || '-'}</td>
                                <td className="p-2 border">
                                    <button onClick={() => handleEdit(u)} className="text-blue-600 hover:underline mr-2">Sửa</button>
                                    <button onClick={() => handleDelete(u._id)} className="text-red-600 hover:underline">Xoá</button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan="7" className="text-center py-4 text-gray-500">Không có người dùng nào.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserListPage;