// src/pages/WoodDetail.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Dashboard.css';
import './FormPage.css';
import './Manager.css';
import speciesData from '../data/speciesData';

function WoodDetail() {
  const { farmId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const [farmDetails, setFarmDetails] = useState(null);
  const [activities, setActivities] = useState([]);
  const [speciesOptions, setSpeciesOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

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

  const fetchData = useCallback(async () => {
    if (!farmId || !token) {
      setError('Thiếu thông tin xác thực hoặc ID cơ sở.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const farmRes = await axios.get(`http://localhost:10000/api/farms/${farmId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const details = farmRes.data;
      setFarmDetails(details);

      let availableSpecies = [];
      if (details.loaiDongVatRung && Array.isArray(details.loaiDongVatRung)) {
        availableSpecies = details.loaiDongVatRung.map(s => s.tenLamSan).filter(Boolean);
      } else if (typeof details.tenLamSan === 'string') {
        availableSpecies.push(details.tenLamSan);
      }
      setSpeciesOptions(availableSpecies);

      const activitiesRes = await axios.get(`http://localhost:10000/api/wood-activities/${farmId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActivities(activitiesRes.data);

      setFormData(prev => ({ ...prev, speciesName: availableSpecies[0] || '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  }, [farmId, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    setFormData(prev => ({ ...prev, speciesName: '' }));

    if (value === 'Nhập thủ công') {
      setIsManualEntry(true);
      setFormData(prev => ({ ...prev, newSpeciesName: '', newScientificName: '' }));
    } else if (value === '') {
      setIsManualEntry(false);
      setFormData(prev => ({ ...prev, newSpeciesName: '', newScientificName: '' }));
    } else {
      setIsManualEntry(false);
      const matched = speciesData.find(s => s.tenLamSan === value);
      if (matched) {
        setFormData(prev => ({
          ...prev,
          newSpeciesName: matched.tenLamSan,
          newScientificName: matched.tenKhoaHoc,
        }));
      }
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const finalSpeciesName = formData.newSpeciesName || formData.speciesName;
      const finalScientificName = formData.newScientificName;

      const dataToSend = { ...formData, speciesName: finalSpeciesName, scientificName: finalScientificName, farm: farmId };
      delete dataToSend.newSpeciesName;
      delete dataToSend.newScientificName;

      await axios.post(`http://localhost:10000/api/wood-activities`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchData();
      setMessage('Thêm bản ghi thành công!');
      setFormData(prev => ({
        ...prev,
        newSpeciesName: '', newScientificName: '', date: '', quantity: 0,
        unit: '', type: '', reason: '', source: '', destination: '', verifiedBy: '',
        speciesName: speciesOptions[0] || ''
      }));
      setSelectedNewSpecies('');
      setIsManualEntry(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Thêm bản ghi thất bại.');
    }
  };

  const handleDeleteActivity = async (activityId) => { /* ... giữ nguyên ... */ };

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
        <div className="form-grid">
          <div className="form-group">
            <label>Tên lâm sản (đã có):</label>
            <select name="speciesName" value={formData.speciesName} onChange={handleFormChange}>
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
                <select id="newSpeciesSelection" value={selectedNewSpecies} onChange={handleNewSpeciesChange}>
                  <option value="">-- Chọn hoặc nhập thủ công --</option>
                  {speciesData.map((species, index) => (
                    <option key={index} value={species.tenLamSan}>{species.tenLamSan}</option>
                  ))}
                  {/* Dòng "Nhập tay..." đã được xóa đi */}
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
              <input type="text" name="source" value={formData.source} onChange={handleFormChange} required/>
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
        {/* ... giữ nguyên ... */}
      </div>
      <div className="detail-actions">
        <button onClick={() => navigate('/admin/woods')} className="cancel-button">Quay lại danh sách</button>
      </div>
    </div>
  );
}

export default WoodDetail;