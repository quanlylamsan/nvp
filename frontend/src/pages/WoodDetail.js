import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// Import CSS
import '../Dashboard.css';
import './FormPage.css';
import './Manager.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

// --- Component Con: Tiêu đề thông tin cơ sở ---
const FarmHeader = ({ farm }) => (
    <section className="farm-details-section">
        <h3>Thông tin chi tiết cơ sở</h3>
        <div className="details-grid">
            <div className="detail-item"><strong>Địa chỉ:</strong><p>{farm?.diaChiCoSo || 'N/A'}</p></div>
            <div className="detail-item"><strong>Loại hình chế biến gỗ:</strong><p>{farm?.loaiHinhCheBienGo || 'N/A'}</p></div>
            <div className="detail-item"><strong>Nguồn gốc gỗ:</strong><p>{farm?.nguonGocGo || 'N/A'}</p></div>
        </div>
    </section>
);

// --- Component Con: Form Nhập/Xuất và Sửa ---
const ActivityForm = ({ farmDetails, farmId, token, onActivityAdded, speciesOptions, onSpeciesChange, selectedSpeciesFromParent, initialData, onFormEditCompleted }) => {
    const [formData, setFormData] = useState({
        speciesName: '',
        date: '',
        quantity: '',
        type: '',
        reason: '',
        source: '',
        destination: '',
        verifiedBy: '',
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const isEditing = !!initialData;

    useEffect(() => {
        if (isEditing) {
            setFormData({
                speciesName: initialData.speciesName || '',
                date: initialData.date ? initialData.date.substring(0, 10) : '',
                quantity: initialData.quantity || '',
                type: initialData.type || '',
                reason: initialData.reason || '',
                source: initialData.source || '',
                destination: initialData.destination || '',
                verifiedBy: initialData.verifiedBy || '',
            });
            onSpeciesChange(initialData.speciesName);
        } else {
            setFormData({
                speciesName: selectedSpeciesFromParent,
                date: '',
                quantity: '',
                type: '',
                reason: '',
                source: '',
                destination: '',
                verifiedBy: '',
            });
        }
    }, [initialData, isEditing, onSpeciesChange, selectedSpeciesFromParent]);


    const selectedProductDetails = useMemo(() => {
        if (!farmDetails || !formData.speciesName) return null;
        return farmDetails.woodProducts?.find(p => p.tenLamSan === formData.speciesName) || null;
    }, [formData.speciesName, farmDetails]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            let updated = { ...prev, [name]: value };
            if (name === 'type') {
                if (value === 'import') updated.destination = '';
                if (value === 'export') updated.source = '';
            }
            return updated;
        });

        if (name === 'speciesName') {
            onSpeciesChange(value);
        }
    };

    const resetForm = () => {
        setFormData({
            speciesName: '',
            date: '',
            quantity: '',
            type: '',
            reason: '',
            source: '',
            destination: '',
            verifiedBy: '',
        });
        onSpeciesChange('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!formData.speciesName || !formData.date || !formData.type || !formData.quantity || parseFloat(formData.quantity) <= 0) {
            setError("Vui lòng điền đầy đủ các trường bắt buộc và số lượng phải lớn hơn 0.");
            return;
        }

        if (formData.type === 'export' && selectedProductDetails && parseFloat(formData.quantity) > selectedProductDetails.khoiLuong) {
            setError("Số lượng xuất không được vượt quá số lượng tồn.");
            return;
        }

        try {
            const dataToSend = {
                ...formData,
                quantity: parseFloat(formData.quantity),
                farm: farmId
            };

            if (isEditing) {
                await axios.put(`${API_BASE_URL}/api/wood-activities/${initialData._id}`, dataToSend, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMessage('✅ Cập nhật bản ghi thành công!');
                onFormEditCompleted();
            } else {
                await axios.post(`${API_BASE_URL}/api/wood-activities`, dataToSend, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMessage('✅ Thêm bản ghi thành công!');
                resetForm();
                onActivityAdded();
            }

        } catch (err) {
            setError(err.response?.data?.message || `❌ ${isEditing ? 'Cập nhật' : 'Thêm'} bản ghi thất bại.`);
        }
    };

    return (
        <section>
            <h3>{isEditing ? 'Sửa bản ghi' : 'Thêm bản ghi nhập/xuất mới:'}</h3>
            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="modern-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label>Tên lâm sản:</label>
                        <select name="speciesName" value={formData.speciesName} onChange={handleFormChange} required>
                            <option value="">-- Chọn lâm sản --</option>
                            {speciesOptions.map((species, index) => (
                                <option key={index} value={species}>{species}</option>
                            ))}
                        </select>
                    </div>

                    {selectedProductDetails && (
                        <>
                            <div className="form-group">
                                <label>Khối lượng tồn (m³):</label>
                                <input type="text" value={selectedProductDetails.khoiLuong || 0} readOnly disabled />
                            </div>
                            <div className="form-group">
                                <label>Tên khoa học:</label>
                                <input type="text" value={selectedProductDetails.tenKhoaHoc || ''} readOnly disabled />
                            </div>
                            <div className="form-group">
                                <label>Loại hình chế biến:</label>
                                <input type="text" value={selectedProductDetails.loaiHinhCheBienGo || ''} readOnly disabled />
                            </div>
                            <div className="form-group">
                                <label>Nguồn gốc:</label>
                                <input type="text" value={selectedProductDetails.nguonGocGo || ''} readOnly disabled />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label>Ngày ghi nhận:</label>
                        <input type="date" name="date" value={formData.date} onChange={handleFormChange} required />
                    </div>

                    <div className="form-group">
                        <label>Loại giao dịch:</label>
                        <select name="type" value={formData.type} onChange={handleFormChange} required>
                            <option value="">-- Chọn loại --</option>
                            <option value="import">Nhập</option>
                            <option value="export">Xuất</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Số lượng (m³):</label>
                        <input type="number" step="any" name="quantity" value={formData.quantity} onChange={handleFormChange} min="0" required />
                    </div>

                    <div className="form-group">
                        <label>Lý do:</label>
                        <input type="text" name="reason" value={formData.reason} onChange={handleFormChange} />
                    </div>

                    {formData.type === 'import' && (
                        <div className="form-group">
                            <label>Nguồn gốc (Mới):</label>
                            <input type="text" name="source" value={formData.source} onChange={handleFormChange} required />
                        </div>
                    )}
                    {formData.type === 'export' && (
                        <div className="form-group">
                            <label>Nơi đến:</label>
                            <input type="text" name="destination" value={formData.destination} onChange={handleFormChange} />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Người xác nhận:</label>
                        <input type="text" name="verifiedBy" value={formData.verifiedBy} onChange={handleFormChange} />
                    </div>
                </div>
                <button type="submit" className="submit-button">{isEditing ? 'Cập nhật bản ghi' : 'Thêm bản ghi'}</button>
                {isEditing && (
                    <button type="button" onClick={() => onFormEditCompleted()} className="cancel-button" style={{ marginLeft: '10px' }}>Hủy</button>
                )}
            </form>
        </section>
    );
};

// --- Component Con: Bảng Lịch sử Hoạt động ---
const ActivityTable = ({ activities, role, onDelete, onEdit }) => (
    <section className="activity-list-container">
        <h3>Lịch sử nhập/xuất gỗ:</h3>
        {activities.length === 0 ? (
            <p>Chưa có bản ghi hoạt động cho cơ sở này.</p>
        ) : (
            <div className="table-wrapper">
                <table className="activity-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên Lâm sản</th>
                            <th>Ngày</th>
                            <th>Loại</th>
                            <th>Số lượng (m³)</th>
                            <th>Lý do</th>
                            <th>Nguồn gốc/Nơi đến</th>
                            <th>Người xác nhận</th>
                            {role === 'admin' && <th>Hành động</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {activities.map((activity, index) => (
                            <tr key={activity._id}>
                                <td>{index + 1}</td>
                                <td>{activity.speciesName}</td>
                                <td>{new Date(activity.date).toLocaleDateString('vi-VN')}</td>
                                <td>{activity.type === 'import' ? 'Nhập' : 'Xuất'}</td>
                                <td>{activity.quantity}</td>
                                <td>{activity.reason}</td>
                                <td>{activity.source || activity.destination}</td>
                                <td>{activity.verifiedBy}</td>
                                {role === 'admin' && (
                                    <td>
                                        <button
                                            onClick={() => onEdit(activity)}
                                            className="edit-button"
                                            style={{ marginRight: '5px' }}
                                        >
                                            Sửa
                                        </button>
                                        <button onClick={() => onDelete(activity._id)} className="delete-button">Xóa</button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </section>
);

// --- Component Chính: WoodDetail ---
function WoodDetail() {
    const { farmId } = useParams();
    const navigate = useNavigate();
    const { auth } = useAuth();
    const token = auth?.token;
    const role = auth?.user?.role;

    const [farmDetails, setFarmDetails] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSpecies, setSelectedSpecies] = useState('');
    const [activityToEdit, setActivityToEdit] = useState(null);

    const fetchData = useCallback(async () => {
        if (!farmId || !token) {
            if (!token) navigate('/login');
            return;
        }
        setLoading(true);
        try {
            const [farmRes, activitiesRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/farms/${farmId}`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/wood-activities/by-farm/${farmId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { speciesName: selectedSpecies }
                })
            ]);
            setFarmDetails(farmRes.data);
            setActivities(activitiesRes.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải dữ liệu.');
            if (err.response?.status === 404) navigate('/admin/wood-farms');
        } finally {
            setLoading(false);
        }
    }, [farmId, token, navigate, selectedSpecies]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteActivity = useCallback(async (activityId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) {
            try {
                await axios.delete(`${API_BASE_URL}/api/wood-activities/${activityId}`, { headers: { Authorization: `Bearer ${token}` } });
                fetchData();
            } catch (err) {
                setError(err.response?.data?.message || 'Xóa bản ghi thất bại.');
            }
        }
    }, [token, fetchData]);

    const handleEditActivity = useCallback((activity) => {
        setActivityToEdit(activity);
    }, []);

    const handleFormEditCompleted = useCallback(() => {
        setActivityToEdit(null);
        fetchData();
    }, [fetchData]);

    if (loading) return <div className="form-container"><p>Đang tải dữ liệu...</p></div>;
    if (error && !farmDetails) return <div className="form-container"><p style={{ color: 'red' }}>Lỗi: {error}</p></div>;

    return (
        <div className="form-container">
            <h2>👁️ Nhật ký hoạt động gỗ của cơ sở: {farmDetails?.tenCoSo}</h2>
            {farmDetails && <FarmHeader farm={farmDetails} />}
            <ActivityForm
                farmDetails={farmDetails}
                farmId={farmId}
                token={token}
                onActivityAdded={fetchData}
                speciesOptions={farmDetails?.woodProducts?.map(s => s.tenLamSan).filter(Boolean) || []}
                onSpeciesChange={setSelectedSpecies}
                selectedSpeciesFromParent={selectedSpecies}
                initialData={activityToEdit}
                onFormEditCompleted={handleFormEditCompleted}
            />
            <ActivityTable
                activities={activities}
                role={role}
                onDelete={handleDeleteActivity}
                onEdit={handleEditActivity}
            />
            <div className="detail-actions">
                <button onClick={() => navigate('/admin/wood-farms')} className="cancel-button">Quay lại danh sách</button>
            </div>
        </div>
    );
}

export default WoodDetail;