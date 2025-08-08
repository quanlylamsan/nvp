// src/components/AddBreedingProductModal.js
import React, { useState, useEffect, useMemo } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AddProductModal.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

const initialState = {
  tenLamSan: '',
  tenKhoaHoc: '',
  danBoMeDuc: '',
  danBoMeCai: '',
  danHauBiDuc: '',
  danHauBiCai: '',
  duoiMotTuoi: '',
  trenMotTuoi: '',
};

Modal.setAppElement('#root');

function FormGroup({ label, name, value, onChange, error, type = 'number' }) {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={error ? 'is-invalid' : ''}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}

function AddBreedingProductModal({ isOpen, onRequestClose, farmId, onProductAdded }) {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const token = useMemo(() => localStorage.getItem('token'), []);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialState);
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    // SỬA LỖI 1: Thay 'tenLoai' thành 'tenLamSan' cho đúng với state và form
    if (!formData.tenLamSan.trim()) newErrors.tenLamSan = 'Vui lòng nhập tên loài.';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      toast.warn('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    const productData = {
    tenLamSan: formData.tenLamSan?.trim(),
    tenKhoaHoc: formData.tenKhoaHoc?.trim(),
    danBoMe: {
        duc: Number(formData.danBoMeDuc || 0),
        cai: Number(formData.danBoMeCai || 0),
    },
    danHauBi: {
        duc: Number(formData.danHauBiDuc || 0),
        cai: Number(formData.danHauBiCai || 0),
    },
    duoiMotTuoi: Number(formData.duoiMotTuoi || 0),
    trenMotTuoi: Number(formData.trenMotTuoi || 0),
};


    
    setLoading(true);
    try {
		console.log("Gửi sản phẩm động vật:", productData);
      await axios.post(`${API_BASE_URL}/api/farms/${farmId}/products/animal`, productData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Thêm thành công!');
      onProductAdded?.();
      onRequestClose();
    } catch (error) {
      console.error("Lỗi khi thêm:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Thêm thất bại.');
    } finally {
      setLoading(false);
    }
  };

  // SỬA LỖI 2: Di chuyển phép tính 'tongDan' vào bên trong component để truy cập được `formData`
  const tongDan =
    ['danBoMeDuc', 'danBoMeCai', 'danHauBiDuc', 'danHauBiCai', 'duoiMotTuoi', 'trenMotTuoi']
      .map(field => Number(formData[field] || 0))
      .reduce((acc, val) => acc + val, 0);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Thêm Đối tượng Gây nuôi"
      className="modal"
      overlayClassName="overlay"
    >
      <h2>Thêm đối tượng gây nuôi</h2>
      <form onSubmit={handleSubmit} className="modal-form" noValidate>
        {/* Sửa lại error để khớp với newErrors.tenLamSan */}
        <FormGroup label="Tên loài" name="tenLamSan" value={formData.tenLamSan} onChange={handleChange} error={errors.tenLamSan} type="text" />
        <FormGroup label="Tên khoa học" name="tenKhoaHoc" value={formData.tenKhoaHoc} onChange={handleChange} type="text" />
        <FormGroup label="Đàn bố mẹ (đực)" name="danBoMeDuc" value={formData.danBoMeDuc} onChange={handleChange} />
        <FormGroup label="Đàn bố mẹ (cái)" name="danBoMeCai" value={formData.danBoMeCai} onChange={handleChange} />
        <FormGroup label="Đàn hậu bị (đực)" name="danHauBiDuc" value={formData.danHauBiDuc} onChange={handleChange} />
        <FormGroup label="Đàn hậu bị (cái)" name="danHauBiCai" value={formData.danHauBiCai} onChange={handleChange} />
        <FormGroup label="Cá thể dưới 1 tuổi" name="duoiMotTuoi" value={formData.duoiMotTuoi} onChange={handleChange} />
        <FormGroup label="Cá thể 1 tuổi trở lên" name="trenMotTuoi" value={formData.trenMotTuoi} onChange={handleChange} />

        <div className="form-group">
          <label>Tổng đàn</label>
          <input type="number" value={tongDan} readOnly className="readonly-field" />
        </div>

        <div className="form-actions-modern">
          <button type="button" className="button-cancel" onClick={onRequestClose} disabled={loading}>Hủy</button>
          <button type="submit" className="button-save" disabled={loading}>
            {loading ? <><span className="spinner"></span> Đang lưu...</> : 'Lưu'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AddBreedingProductModal;