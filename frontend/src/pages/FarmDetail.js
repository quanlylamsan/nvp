// src/pages/FarmDetail.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; // Tối ưu: Dùng context để nhất quán

// Import CSS
import '../Dashboard.css';
import './FormPage.css';
import './Manager.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

function FarmDetail() {
    // === PHẦN KHAI BÁO STATE VÀ HOOKS ===
    const { id: farmId } = useParams(); // Lấy ID từ URL, đổi tên thành farmId để rõ ràng
    const navigate = useNavigate();
    const { auth } = useAuth(); // Tối ưu: Lấy thông tin auth từ context
    const token = auth?.token;
    const role = auth?.role;

    // State cho dữ liệu
    const [farm, setFarm] = useState(null);
    const [activities, setActivities] = useState([]);

    // State cho trạng thái UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // State cho form nhập liệu hoạt động
    const [activityFormData, setActivityFormData] = useState({
        speciesName: '',
        date: '',
        totalIndividuals: 0,
        currentStatus: { parents: { male: 0, female: 0 }, otherIndividuals: { male: 0, female: 0, unidentified: 0 } },
        increase: { parents: { male: 0, female: 0 }, otherIndividuals: { male: 0, female: 0, unidentified: 0 } },
        decrease: { parents: { male: 0, female: 0 }, otherIndividuals: { male: 0, female: 0, unidentified: 0 } },
        reasonForChange: '',
        verifiedBy: '',
    });

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
            // Tối ưu: Gọi đồng thời cả hai API để tăng tốc độ
            const [farmRes, activitiesRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/farms/${farmId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(`${API_BASE_URL}/api/farm-activities/${farmId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            ]);

            const details = farmRes.data;
            setFarm(details);
            setActivities(activitiesRes.data || []);

            // Cập nhật speciesName mặc định cho form
            const defaultSpecies = details.loaiDongVatRung?.[0]?.tenLamSan || details.tenLamSan || '';
            setActivityFormData(prev => ({ ...prev, speciesName: defaultSpecies }));

        } catch (err) {
            console.error('Lỗi khi tải dữ liệu:', err);
            setError(err.response?.data?.message || 'Không thể tải dữ liệu.');
            if (err.response?.status === 404) {
                navigate('/admin/breeding-farms'); // Chuyển hướng nếu không tìm thấy cơ sở
            }
        } finally {
            setLoading(false);
        }
    }, [farmId, token, navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // === PHẦN XỬ LÝ FORM ===
    const handleActivityFormChange = (e) => {
        const { name, value } = e.target;
        const keys = name.split('.');

        if (keys.length === 1) { // Trường hợp state cấp 1
            setActivityFormData(prev => ({ ...prev, [name]: value }));
        } else if (keys.length === 3) { // Trường hợp state lồng 3 cấp
            const [mainField, subField, prop] = keys;
            setActivityFormData(prev => ({
                ...prev,
                [mainField]: {
                    ...prev[mainField],
                    [subField]: {
                        ...prev[mainField][subField],
                        [prop]: parseInt(value, 10) || 0,
                    },
                },
            }));
        }
    };

    const handleAddActivity = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const dataToSend = { ...activityFormData, farm: farmId };
            await axios.post(`${API_BASE_URL}/api/farm-activities`, dataToSend, {
                headers: { Authorization: `Bearer ${token}` },
            });
            await fetchData(); // Tải lại dữ liệu mới
            setMessage('Thêm bản ghi thành công!');
            // Reset form
            setActivityFormData(prev => ({
                ...prev,
                date: '',
                totalIndividuals: 0,
                currentStatus: { parents: { male: 0, female: 0 }, otherIndividuals: { male: 0, female: 0, unidentified: 0 } },
                increase: { parents: { male: 0, female: 0 }, otherIndividuals: { male: 0, female: 0, unidentified: 0 } },
                decrease: { parents: { male: 0, female: 0 }, otherIndividuals: { male: 0, female: 0, unidentified: 0 } },
                reasonForChange: '',
                verifiedBy: '',
            }));
        } catch (err) {
            console.error('Lỗi khi thêm bản ghi:', err);
            setError(err.response?.data?.message || 'Thêm bản ghi thất bại.');
        }
    };

    const handleDeleteActivity = useCallback(async (activityId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) {
            setMessage('');
            setError('');
            try {
                await axios.delete(`${API_BASE_URL}/api/farm-activities/${activityId}`, {
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
    if (error) return <div className="form-container"><p style={{ color: 'red' }}>Lỗi: {error}</p></div>;
    if (!farm) return <div className="form-container"><p>Không tìm thấy thông tin cơ sở.</p></div>;

    return (
        <div className="form-container">
            <style>{`
                /* Giữ nguyên các style của bạn */
            `}</style>
            <h2>👁️ Sổ theo dõi: {farm.tenCoSo}</h2>
            <div className="form-grid">
                <div className="detail-group"><strong>Tên cơ sở:</strong> <p>{farm.tenCoSo}</p></div>
                <div className="detail-group"><strong>Địa chỉ:</strong> <p>{farm.diaChiCoSo}</p></div>
                <div className="form-group detail-group">
                    <label>Tên loài:</label>
                    <select name="speciesName" value={activityFormData.speciesName} onChange={handleActivityFormChange} required>
                        <option value="">-- Chọn loài --</option>
                        {farm.loaiDongVatRung?.map((species, index) => (
                            <option key={index} value={species.tenLamSan}>{species.tenLamSan}</option>
                        ))}
                    </select>
                </div>
            </div>

            <h3>Thêm bản ghi theo dõi mới:</h3>
            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleAddActivity} className="modern-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label>Ngày ghi nhận:</label>
                        <input type="date" name="date" value={activityFormData.date} onChange={handleActivityFormChange} required />
                    </div>
                    <div className="form-group">
                        <label>Lý do thay đổi:</label>
                        <input type="text" name="reasonForChange" value={activityFormData.reasonForChange} onChange={handleActivityFormChange} />
                    </div>
                </div>
                <div className="form-grid">
                    <div className="form-section-wrapper">
                        <h4>Tăng:</h4>
                        <div className="form-grid nested-grid">
                            <div className="form-section">
                                <h5>Bố mẹ:</h5>
                                <div className="form-section-row">
                                    <div className="form-group"><label>Đực:</label><input type="number" name="increase.parents.male" value={activityFormData.increase.parents.male} onChange={handleActivityFormChange} min="0" /></div>
                                    <div className="form-group"><label>Cái:</label><input type="number" name="increase.parents.female" value={activityFormData.increase.parents.female} onChange={handleActivityFormChange} min="0" /></div>
                                </div>
                            </div>
                            <div className="form-section">
                                <h5>Loài khác:</h5>
                                <div className="form-section-row">
                                    <div className="form-group"><label>Đực:</label><input type="number" name="increase.otherIndividuals.male" value={activityFormData.increase.otherIndividuals.male} onChange={handleActivityFormChange} min="0" /></div>
                                    <div className="form-group"><label>Cái:</label><input type="number" name="increase.otherIndividuals.female" value={activityFormData.increase.otherIndividuals.female} onChange={handleActivityFormChange} min="0" /></div>
                                    <div className="form-group"><label>Không xác định:</label><input type="number" name="increase.otherIndividuals.unidentified" value={activityFormData.increase.otherIndividuals.unidentified} onChange={handleActivityFormChange} min="0" /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="form-section-wrapper">
                        <h4>Giảm:</h4>
                        <div className="form-grid nested-grid">
                            <div className="form-section">
                                <h5>Bố mẹ:</h5>
                                <div className="form-section-row">
                                    <div className="form-group"><label>Đực:</label><input type="number" name="decrease.parents.male" value={activityFormData.decrease.parents.male} onChange={handleActivityFormChange} min="0" /></div>
                                    <div className="form-group"><label>Cái:</label><input type="number" name="decrease.parents.female" value={activityFormData.decrease.parents.female} onChange={handleActivityFormChange} min="0" /></div>
                                </div>
                            </div>
                            <div className="form-section">
                                <h5>Loài khác:</h5>
                                <div className="form-section-row">
                                    <div className="form-group"><label>Đực:</label><input type="number" name="decrease.otherIndividuals.male" value={activityFormData.decrease.otherIndividuals.male} onChange={handleActivityFormChange} min="0" /></div>
                                    <div className="form-group"><label>Cái:</label><input type="number" name="decrease.otherIndividuals.female" value={activityFormData.decrease.otherIndividuals.female} onChange={handleActivityFormChange} min="0" /></div>
                                    <div className="form-group"><label>Không xác định:</label><input type="number" name="decrease.otherIndividuals.unidentified" value={activityFormData.decrease.otherIndividuals.unidentified} onChange={handleActivityFormChange} min="0" /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <button type="submit" className="submit-button">Thêm bản ghi</button>
            </form>

            <h3>Lịch sử theo dõi:</h3>
            <div className="activity-list-container">
                {activities.length === 0 ? (
                    <p>Chưa có bản ghi theo dõi cho cơ sở này.</p>
                ) : (
                    <table className="activity-table">
                        <thead>
                            <tr>
                                <th rowSpan="3">Stt</th>
                                <th rowSpan="3">Ngày</th>
                                <th rowSpan="3">Tổng số cá thể</th>
                                <th colSpan="5">Hiện trạng</th>
                                <th colSpan="10">Biến động</th>
                                <th rowSpan="3">Lý do</th>
                                <th rowSpan="3">Người xác nhận</th>
                                {role === 'admin' && <th rowSpan="3">Hành động</th>}
                            </tr>
                            <tr>
                                <th colSpan="2">Bố mẹ</th>
                                <th colSpan="3">Loài khác</th>
                                <th colSpan="5">Tăng</th>
                                <th colSpan="5">Giảm</th>
                            </tr>
                            <tr>
                                <th>Đực</th><th>Cái</th>
                                <th>Đực</th><th>Cái</th><th>Không xác định</th>
                                <th>Đực (BM)</th><th>Cái (BM)</th><th>Đực (LK)</th><th>Cái (LK)</th><th>KXD (LK)</th>
                                <th>Đực (BM)</th><th>Cái (BM)</th><th>Đực (LK)</th><th>Cái (LK)</th><th>KXD (LK)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activities.map((activity, index) => (
                                <tr key={activity._id}>
                                    <td>{index + 1}</td>
                                    <td>{activity.date ? new Date(activity.date).toLocaleDateString() : 'N/A'}</td>
                                    <td>{activity.totalIndividuals ?? 0}</td>
                                    <td>{activity.currentStatus?.parents?.male ?? 0}</td>
                                    <td>{activity.currentStatus?.parents?.female ?? 0}</td>
                                    <td>{activity.currentStatus?.otherIndividuals?.male ?? 0}</td>
                                    <td>{activity.currentStatus?.otherIndividuals?.female ?? 0}</td>
                                    <td>{activity.currentStatus?.otherIndividuals?.unidentified ?? 0}</td>
                                    <td>{activity.increase?.parents?.male ?? 0}</td>
                                    <td>{activity.increase?.parents?.female ?? 0}</td>
                                    <td>{activity.increase?.otherIndividuals?.male ?? 0}</td>
                                    <td>{activity.increase?.otherIndividuals?.female ?? 0}</td>
                                    <td>{activity.increase?.otherIndividuals?.unidentified ?? 0}</td>
                                    <td>{activity.decrease?.parents?.male ?? 0}</td>
                                    <td>{activity.decrease?.parents?.female ?? 0}</td>
                                    <td>{activity.decrease?.otherIndividuals?.male ?? 0}</td>
                                    <td>{activity.decrease?.otherIndividuals?.female ?? 0}</td>
                                    <td>{activity.decrease?.otherIndividuals?.unidentified ?? 0}</td>
                                    <td>{activity.reasonForChange || 'N/A'}</td>
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
                <button onClick={() => navigate('/admin/breeding-farms')} className="cancel-button">Quay lại danh sách</button>
            </div>
        </div>
    );
}

export default FarmDetail;
