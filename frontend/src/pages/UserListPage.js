import React, { useEffect, useState } from 'react';
import axios from 'axios';


const UserListPage = () => {
    // --- State của trang ---
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const token = localStorage.getItem('token');

    // --- State quản lý tải và lỗi ---
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- State cho form và đơn vị hành chính ---
    const [formData, setFormData] = useState({
        email: '', password: '', displayName: '', employeeId: '', role: 'staff', province: '', communes: [],
    });
    const [provinces, setProvinces] = useState([]);
    const [communesList, setCommunesList] = useState([]);
    const [selectedCommune, setSelectedCommune] = useState('');

    const apiHeaders = { headers: { Authorization: `Bearer ${token}` } };
    const API_URL = process.env.REACT_APP_API_URL || '';

    // --- Tải dữ liệu ban đầu ---
    useEffect(() => {
        const fetchInitialData = async () => {
            if (!token) {
                setError('Chưa đăng nhập hoặc phiên làm việc đã hết hạn.');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const [usersRes, provincesRes] = await Promise.all([
                    axios.get(`${API_URL}/api/users`, apiHeaders),
                    axios.get(`${API_URL}/api/master-product-list/provinces`, apiHeaders)
                ]);
                
                setUsers(usersRes.data);
                setProvinces(provincesRes.data);

            } catch (err) {
                console.error('Lỗi khi tải dữ liệu ban đầu:', err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    setError('Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
                } else {
                    setError('Không thể tải dữ liệu từ máy chủ. Lỗi: ' + (err.response?.data?.message || err.message));
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, [token]);
    
    // --- Tải danh sách xã khi tỉnh thay đổi ---
    useEffect(() => {
        const fetchCommunes = async () => {
            if (formData.province && token) {
                try {
                    const res = await axios.get(`${API_URL}/api/master-product-list/communes?provinceCode=${formData.province}`, apiHeaders);
                    setCommunesList(res.data);
                } catch (err) {
                    console.error('Lỗi khi tải danh sách xã:', err);
                    setCommunesList([]);
                }
            } else {
                setCommunesList([]);
            }
        };
        fetchCommunes();
    }, [formData.province, token]);
    
    // --- Các hàm xử lý khác ---
    const resetFormState = () => {
        setFormData({
            email: '', password: '', displayName: '', employeeId: '', role: 'staff', province: '', communes: [],
        });
        setSelectedCommune('');
        setCommunesList([]);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'province') {
            setFormData((prev) => ({ ...prev, [name]: value, communes: [] }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleAddCommune = () => {
        if (selectedCommune && !formData.communes.includes(selectedCommune)) {
            setFormData(prev => ({ ...prev, communes: [...prev.communes, selectedCommune] }));
            setSelectedCommune('');
        }
    };

    const handleRemoveCommune = (communeToRemove) => {
        setFormData(prev => ({ ...prev, communes: prev.communes.filter(c => c !== communeToRemove) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = { ...formData };
            if (editingUser) {
                // Logic sửa
            } else {
                await axios.post(`${API_URL}/api/users`, dataToSend, apiHeaders);
            }
            const res = await axios.get(`${API_URL}/api/users`, apiHeaders);
            setUsers(res.data);
            handleCancel();
        } catch (err) {
            console.error('Lỗi khi lưu người dùng:', err);
            alert('Lỗi khi lưu người dùng');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xoá người dùng này?')) return;
        try {
            await axios.delete(`${API_URL}/api/users/${id}`, apiHeaders);
            const res = await axios.get(`${API_URL}/api/users`, apiHeaders);
            setUsers(res.data);
        } catch (err) {
            console.error('Lỗi khi xoá người dùng:', err);
            alert('Lỗi khi xoá người dùng');
        }
    };

    const handleEdit = (user) => setEditingUser(user);
    const handleAddNew = () => { setIsCreating(true); setEditingUser(null); resetFormState(); };
    const handleCancel = () => { setIsCreating(false); setEditingUser(null); resetFormState(); };

    if (isLoading) {
        return <div className="user-list-container"><h2>Đang tải dữ liệu...</h2></div>;
    }

    if (error) {
        return <div className="user-list-container error-message"><h2>Lỗi: {error}</h2></div>;
    }

    return (
        <div className="user-list-container">
            <div className="header">
                <h2>👤 Quản lý người dùng</h2>
                <button className="btn btn-primary" onClick={handleAddNew}>+ Thêm người dùng</button>
            </div>

            {(isCreating || editingUser) && (
                <div className="form-container">
                    <h3>{editingUser ? 'Chỉnh sửa người dùng' : 'Tạo người dùng mới'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label>Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div>
                            <label>Mật khẩu</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={editingUser ? 'Để trống nếu không đổi' : ''} required={!editingUser} />
                        </div>
                        <div>
                            <label>Họ tên</label>
                            <input type="text" name="displayName" value={formData.displayName} onChange={handleChange} required />
                        </div>
                         <div>
                            <label>Mã nhân viên</label>
                            <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} />
                        </div>
                        <div>
                            <label>Vai trò</label>
                            <select name="role" value={formData.role} onChange={handleChange}>
                                <option value="staff">Nhân viên (Staff)</option>
                                <option value="manager">Quản lý (Manager)</option>
                                <option value="admin">Quản trị (Admin)</option>
                            </select>
                        </div>
                        <div>
                            <label>Tỉnh/Thành phố</label>
                            <select name="province" value={formData.province} onChange={handleChange} required>
                                <option value="">-- Chọn Tỉnh/Thành phố --</option>
                                {Array.isArray(provinces) && provinces.map((p) => (
                                    <option key={p.code} value={p.code}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>Danh sách xã quản lý</label>
                            <div className="input-group">
                                <select value={selectedCommune} onChange={(e) => setSelectedCommune(e.target.value)} disabled={!formData.province}>
                                    <option value="">-- Chọn xã --</option>
                                    {Array.isArray(communesList) && communesList.map((c) => (
                                        <option key={c.code} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                                <button type="button" className="btn" onClick={handleAddCommune} disabled={!selectedCommune}>Thêm</button>
                            </div>
                            <div className="tags-container">
                                {Array.isArray(formData.communes) && formData.communes.map((commune, index) => (
                                    <span key={`${commune}-${index}`} className="tag">
                                        {commune}
                                        <button type="button" onClick={() => handleRemoveCommune(commune)}>&times;</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-success">{editingUser ? 'Lưu thay đổi' : 'Tạo mới'}</button>
                            <button type="button" className="btn-cancel" onClick={handleCancel}>Huỷ</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Email</th><th>Tên</th><th>Vai trò</th><th>Tỉnh</th><th>Xã</th><th>Mã NV</th><th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(users) && users.map((user) => (
                            <tr key={user._id}>
                                <td>{user.email}</td>
                                <td>{user.displayName}</td>
                                <td>{user.role}</td>
                                <td>{provinces.find(p => p.code === user.province)?.name || user.province || '-'}</td>
                                <td>{Array.isArray(user.communes) ? user.communes.join(', ') : ''}</td>
                                <td>{user.employeeId || '-'}</td>
                                <td>
                                    <button onClick={() => handleEdit(user)} className="btn-edit">Sửa</button>
                                    <button onClick={() => handleDelete(user._id)} className="btn-delete">Xoá</button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr><td colSpan="7">Không có người dùng nào.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserListPage;
