// src/pages/WoodDetail.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; // Tối ưu: Dùng context để nhất quán
import speciesData from '../data/speciesData'; // Đảm bảo speciesData này tồn tại và có định dạng đúng

// Import CSS
import '../Dashboard.css';
import './FormPage.css';
import './Manager.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

function WoodDetail() {
    // === PHẦN KHAI BÁO STATE VÀ HOOKS ===
    const { id: farmId } = useParams(); // Lấy ID từ URL, đổi tên thành farmId để rõ ràng
    const navigate = useNavigate();
    const { auth } = useAuth(); // Tối ưu: Lấy thông tin auth từ context
    const token = auth?.token;
    const role = auth?.role;

    // State cho dữ liệu
    const [farmDetails, setFarmDetails] = useState(null);
    const [activities, setActivities] = useState([]);
    const [speciesOptions, setSpeciesOptions] = useState([]); // Các loài có sẵn của cơ sở

    // State cho trạng thái UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // State cho form nhập liệu
    const [formData, setFormData] = useState({
        speciesName: '',
        newSpeciesName: '',
        newScientificName: '',
        date: '',
        quantity: 0,
        unit: '',
        type: '',
        reason: '',
        source: '',
        destination: '',
        verifiedBy: '',
    });
    const [selectedNewSpecies, setSelectedNewSpecies] = useState('');
    const [isManualEntry, setIsManualEntry] = useState(false);

    // === PHẦN TẢI DỮ LIỆU ===
    const fetchData = useCallback(async () => {
        if (!farmId || !token) {
            setError('Thiếu thông tin xác thực hoặc ID cơ sở.');
            setLoading(false);
            if (!token) navigate('/login');
            return;
        }
        setLoading(true);
        setError('');
        setMessage('');
        try {
            // Gọi đồng thời cả hai API để tăng tốc độ
            const [farmRes, activitiesRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/farms/${farmId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(`${API_BASE_URL}/api/wood-activities/${farmId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            ]);

            const details = farmRes.data;
            setFarmDetails(details);
            setActivities(activitiesRes.data || []);

            // Xử lý danh sách các loài có sẵn
            let availableSpecies = details.products?.map(s => s.tenLamSan).filter(Boolean) || [];
            setSpeciesOptions(availableSpecies);

            // Đặt lại giá trị mặc định cho form
            setFormData(prev => ({ ...prev, speciesName: availableSpecies[0] || '' }));

        } catch (err) {
            console.error('Lỗi khi tải dữ liệu:', err);
            setError(err.response?.data?.message || 'Không thể tải dữ liệu.');
            if (err.response?.status === 404) {
                navigate('/admin/wood-farms'); // Chuyển hướng nếu không tìm thấy cơ sở
            }
        } finally {
            setLoading(false);
        }
    }, [farmId, token, navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // === PHẦN XỬ LÝ FORM ===
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'quantity' ? parseInt(value, 10) || 0 : value,
        }));
    };

    const handleNewSpeciesChange = (e) => {
        const value = e.target.value;
        setSelectedNewSpecies(value);
        setFormData(prev => ({ ...prev, speciesName: '' })); // Reset loài đã có khi chọn loài mới

        if (value === 'Nhập thủ công') {
            setIsManualEntry(true);
            setFormData(prev => ({ ...prev, newSpeciesName: '', newScientificName: '' }));
        } else {
            setIsManualEntry(false);
            const matched = speciesData.find(s => s.tenLamSan === value);
            setFormData(prev => ({
                ...prev,
                newSpeciesName: matched ? matched.tenLamSan : '',
                newScientificName: matched ? matched.tenKhoaHoc : '',
            }));
        }
    };

    const handleAddActivity = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const finalSpeciesName = formData.newSpeciesName || formData.speciesName;
            if (!finalSpeciesName) {
                setError("Vui lòng chọn hoặc nhập tên lâm sản.");
                return;
            }
            const finalScientificName = formData.newScientificName || (speciesData.find(s => s.tenLamSan === finalSpeciesName)?.tenKhoaHoc || '');

            const dataToSend = { ...formData, speciesName: finalSpeciesName, scientificName: finalScientificName, farm: farmId };
            // Xóa các trường tạm thời không cần gửi đi
            delete dataToSend.newSpeciesName;
            delete dataToSend.newScientificName;

            await axios.post(`${API_BASE_URL}/api/wood-activities`, dataToSend, {
                headers: { Authorization: `Bearer ${token}` },
            });

            await fetchData(); // Tải lại dữ liệu mới
            setMessage('Thêm bản ghi thành công!');
            // Reset form về trạng thái ban đầu
            setFormData({
                speciesName: speciesOptions[0] || '', newSpeciesName: '', newScientificName: '',
                date: '', quantity: 0, unit: '', type: '', reason: '',
                source: '', destination: '', verifiedBy: '',
            });
            setSelectedNewSpecies('');
            setIsManualEntry(false);

        } catch (err) {
            console.error('Lỗi khi thêm bản ghi:', err);
            setError(err.response?.data?.message || 'Thêm bản ghi thất bại.');
        }
    };

    const handleDeleteActivity = useCallback(async (activityId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) {
            try {
                await axios.delete(`${API_BASE_URL}/api/wood-activities/${activityId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMessage('Bản ghi đã được xóa thành công.');
                setActivities(prev => prev.filter(act => act._id !== activityId)); // Tối ưu: Xóa trực tiếp trên state
            } catch (err) {
                console.error('Lỗi khi xóa bản ghi:', err);
                setError(err.response?.data?.message || 'Xóa bản ghi thất bại.');
            }
        }
    }, [token]);

    // === PHẦN HIỂN THỊ (RENDER) ===
    if (loading) return <div className="form-container"><p>Đang tải dữ liệu...</p></div>;
    if (error && !farmDetails) return <div className="form-container"><p style={{ color: 'red' }}>Lỗi: {error}</p></div>;

    return (
        <div className="form-container">
            <h2>👁️ Nhật ký hoạt động gỗ của cơ sở: {farmDetails?.tenCoSo || 'N/A'}</h2>
            <section className="farm-details-section">
                <h3>Thông tin chi tiết cơ sở</h3>
                <div className="details-grid">
                    <div className="detail-item"><strong>Địa chỉ:</strong><p>{farmDetails?.diaChiCoSo || 'N/A'}</p></div>
                    <div className="detail-item"><strong>Loại hình chế biến gỗ:</strong><p>{farmDetails?.loaiHinhCheBienGo || 'N/A'}</p></div>
                    <div className="detail-item"><strong>Nguồn gốc gỗ:</strong><p>{farmDetails?.nguonGocGo || 'N/A'}</p></div>
                </div>
            </section>

            <h3>Thêm bản ghi nhập/xuất mới:</h3>
            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleAddActivity} className="modern-form">
                {/* ... Giữ nguyên cấu trúc form của bạn ... */}
                <div className="form-grid">
                    <div className="form-group">
                        <label>Tên lâm sản (đã có):</label>
                        <select name="speciesName" value={formData.speciesName} onChange={handleFormChange} disabled={!!selectedNewSpecies}>
                            <option value="">-- Chọn lâm sản đã có --</option>
                            {speciesOptions.map((species, index) => (
                                <option key={index} value={species}>{species}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group-full-width" style={{ gridColumn: '1 / -1', border: '1px dashed #007bff', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px', color: '#007bff' }}>
                            Hoặc đăng ký mới lâm sản
                        </label>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="newSpeciesSelection">Tên lâm sản mới:</label>
                                <select id="newSpeciesSelection" value={selectedNewSpecies} onChange={handleNewSpeciesChange} disabled={!!formData.speciesName}>
                                    <option value="">-- Chọn hoặc nhập thủ công --</option>
                                    {speciesData.map((species, index) => (
                                        <option key={index} value={species.tenLamSan}>{species.tenLamSan}</option>
                                    ))}
                                    <option value="Nhập thủ công">Nhập thủ công...</option>
                                </select>
                            </div>

                            {!isManualEntry && selectedNewSpecies && selectedNewSpecies !== 'Nhập thủ công' && (
                                <div className="form-group">
                                    <label>Tên khoa học (tự động):</label>
                                    <input type="text" value={formData.newScientificName} readOnly disabled />
                                </div>
                            )}

                            {isManualEntry && (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="newSpeciesName">Tên lâm sản (nhập thủ công):</label>
                                        <input type="text" name="newSpeciesName" value={formData.newSpeciesName} onChange={handleFormChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="newScientificName">Tên khoa học (nhập thủ công):</label>
                                        <input type="text" name="newScientificName" value={formData.newScientificName} onChange={handleFormChange} />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

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
                        <label>Số lượng:</label>
                        <input type="number" name="quantity" value={formData.quantity} onChange={handleFormChange} min="0" required />
                    </div>
                    <div className="form-group">
                        <label>Đơn vị:</label>
                        <input type="text" name="unit" value={formData.unit} onChange={handleFormChange} required />
                    </div>
                    <div className="form-group">
                        <label>Lý do:</label>
                        <input type="text" name="reason" value={formData.reason} onChange={handleFormChange} />
                    </div>
                    {formData.type === 'import' && (
                        <div className="form-group">
                            <label>Nguồn gốc:</label>
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
                <button type="submit" className="submit-button">Thêm bản ghi</button>
            </form>

            <h3>Lịch sử nhập/xuất gỗ:</h3>
            <div className="activity-list-container">
                {activities.length === 0 ? (
                    <p>Chưa có bản ghi hoạt động cho cơ sở này.</p>
                ) : (
                    <table className="activity-table">
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>Tên Lâm sản</th>
                                <th>Ngày</th>
                                <th>Loại</th>
                                <th>Số lượng</th>
                                <th>Đơn vị</th>
                                <th>Lý do</th>
                                <th>Nguồn gốc/Nơi đến</th>
                                <th>Người xác nhận</th>
                                {role === 'admin' && <th>Hành động</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {activities.map((activity, index) => (
                                <tr key={activity._id || index}>
                                    <td>{index + 1}</td>
                                    <td>{activity.speciesName || 'N/A'}</td>
                                    <td>{activity.date ? new Date(activity.date).toLocaleDateString() : 'N/A'}</td>
                                    <td>{activity.type === 'import' ? 'Nhập' : 'Xuất'}</td>
                                    <td>{activity.quantity ?? 0}</td>
                                    <td>{activity.unit || 'N/A'}</td>
                                    <td>{activity.reason || 'N/A'}</td>
                                    <td>{activity.source || activity.destination || 'N/A'}</td>
                                    <td>{activity.verifiedBy || 'N/A'}</td>
                                    {role === 'admin' && (
                                        <td>
                                            <button onClick={() => handleDeleteActivity(activity._id)} className="delete-button">Xóa</button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <div className="detail-actions">
                <button onClick={() => navigate('/admin/wood-farms')} className="cancel-button">Quay lại danh sách</button>
            </div>
        </div>
    );
}

export default WoodDetail;
