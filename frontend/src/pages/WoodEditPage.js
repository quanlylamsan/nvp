// src/pages/WoodEditPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; // Tối ưu: Dùng context để nhất quán
import speciesOptions from '../data/speciesData'; // Import danh sách loài

// Import CSS
import '../Dashboard.css';
import './FormPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

// Khởi tạo state ban đầu cho form
const initialFarmData = {
    tenCoSo: '', tinhThanhPho: '', xaPhuong: '', diaChiCoSo: '',
    vido: '', kinhdo: '', ngayThanhLap: '', giayPhepKinhDoanh: '',
    tenNguoiDaiDien: '', namSinh: '', soCCCD: '', ngayCapCCCD: '',
    noiCapCCCD: '', soDienThoaiNguoiDaiDien: '', diaChiNguoiDaiDien: '',
    mucDichNuoi: '', hinhThucNuoi: '', maSoCoSoGayNuoi: '', tongDan: '',
    loaiHinhKinhDoanhGo: '', nganhNgheKinhDoanhGo: '', khoiLuong: '',
    loaiCoSoDangKy: '', tenLamSan: '', tenKhoaHoc: '',
    issueDate: '', expiryDate: '', trangThai: '', ghiChu: '',
};

function FarmEditPage() {
    // === PHẦN KHAI BÁO STATE VÀ HOOKS ===
    const { id: farmId } = useParams();
    const navigate = useNavigate();
    const { auth } = useAuth(); // Tối ưu: Lấy thông tin auth từ context
    const token = auth?.token;

    const [farmData, setFarmData] = useState(initialFarmData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showManualSpeciesInput, setShowManualSpeciesInput] = useState(false);

    // === PHẦN TẢI DỮ LIỆU ===
    const fetchFarmData = useCallback(async () => {
        if (!farmId || !token) {
            setError('Thiếu thông tin xác thực hoặc ID cơ sở.');
            setLoading(false);
            if (!token) navigate('/login');
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/farms/${farmId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data;

            // Tối ưu: Tạo một đối tượng mới với tất cả các key từ initial state
            // để tránh lỗi "controlled to uncontrolled component"
            const formattedData = { ...initialFarmData };
            for (const key in formattedData) {
                if (data[key] !== null && data[key] !== undefined) {
                    // Định dạng lại ngày tháng cho input type="date"
                    if (['ngayThanhLap', 'ngayCapCCCD', 'issueDate', 'expiryDate'].includes(key) && data[key]) {
                        formattedData[key] = new Date(data[key]).toISOString().split('T')[0];
                    } else {
                        formattedData[key] = data[key];
                    }
                }
            }
            setFarmData(formattedData);

            // Kiểm tra nếu tên lâm sản không có trong speciesOptions thì hiển thị input thủ công
            if (formattedData.tenLamSan && !speciesOptions.some(s => s.tenLamSan === formattedData.tenLamSan)) {
                setShowManualSpeciesInput(true);
            }

        } catch (err) {
            console.error('Lỗi khi tải dữ liệu cơ sở:', err);
            setError('Không thể tải dữ liệu cơ sở. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, [farmId, token, navigate]);

    useEffect(() => {
        fetchFarmData();
    }, [fetchFarmData]);

    // === PHẦN XỬ LÝ FORM ===
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'tenLamSan') {
            if (value === 'Nhập thủ công') {
                setShowManualSpeciesInput(true);
                setFarmData(prev => ({ ...prev, tenLamSan: '', tenKhoaHoc: '' }));
            } else {
                setShowManualSpeciesInput(false);
                const selectedSpecies = speciesOptions.find(s => s.tenLamSan === value);
                setFarmData(prev => ({
                    ...prev,
                    tenLamSan: value,
                    tenKhoaHoc: selectedSpecies ? selectedSpecies.tenKhoaHoc : ''
                }));
            }
        } else {
            setFarmData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        try {
            const dataToSend = { ...farmData };

            // Tối ưu: Xóa các trường không liên quan dựa trên loại hình đăng ký
            if (dataToSend.loaiCoSoDangKy === 'Đăng ký cơ sở gây nuôi động vật') {
                delete dataToSend.loaiHinhKinhDoanhGo;
                delete dataToSend.nganhNgheKinhDoanhGo;
                delete dataToSend.khoiLuong;
            } else if (dataToSend.loaiCoSoDangKy === 'Đăng ký cơ sở kinh doanh, chế biến gỗ') {
                delete dataToSend.mucDichNuoi;
                delete dataToSend.hinhThucNuoi;
                delete dataToSend.maSoCoSoGayNuoi;
                delete dataToSend.tongDan;
            }

            await axios.put(`${API_BASE_URL}/api/farms/${farmId}`, dataToSend, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccessMessage('Cập nhật thông tin cơ sở thành công!');
            
        } catch (err) {
            console.error('Lỗi khi cập nhật cơ sở:', err);
            const message = err.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật. Vui lòng thử lại.';
            setError(message);
        }
    };

    // === PHẦN HIỂN THỊ (RENDER) ===
    if (loading) {
        return <div className="form-container"><p>Đang tải thông tin cơ sở...</p></div>;
    }

    return (
        <div className="form-container">
            <h1>Chỉnh sửa thông tin cơ sở</h1>
            {successMessage && <p className="success-message">{successMessage}</p>}
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
                <section className="khai-bao-section">
                    <h2>Thông tin cơ sở</h2>
                    <div className="form-grid">
                        <div className="form-group"><label htmlFor="tenCoSo">Tên cơ sở:</label><input type="text" id="tenCoSo" name="tenCoSo" value={farmData.tenCoSo} onChange={handleChange} required /></div>
                        <div className="form-group"><label htmlFor="tinhThanhPho">Tỉnh (Thành phố):</label><input type="text" id="tinhThanhPho" name="tinhThanhPho" value={farmData.tinhThanhPho} onChange={handleChange} required /></div>
                        <div className="form-group"><label htmlFor="xaPhuong">Xã (Phường):</label><input type="text" id="xaPhuong" name="xaPhuong" value={farmData.xaPhuong} onChange={handleChange} required /></div>
                        <div className="form-group"><label htmlFor="diaChiCoSo">Địa chỉ:</label><input type="text" id="diaChiCoSo" name="diaChiCoSo" value={farmData.diaChiCoSo} onChange={handleChange} required /></div>
                        <div className="form-group"><label htmlFor="vido">Vĩ độ:</label><input type="text" id="vido" name="vido" value={farmData.vido} onChange={handleChange} /></div>
                        <div className="form-group"><label htmlFor="kinhdo">Kinh độ:</label><input type="text" id="kinhdo" name="kinhdo" value={farmData.kinhdo} onChange={handleChange} /></div>
                        <div className="form-group"><label htmlFor="ngayThanhLap">Ngày thành lập:</label><input type="date" id="ngayThanhLap" name="ngayThanhLap" value={farmData.ngayThanhLap} onChange={handleChange} /></div>
                        <div className="form-group"><label htmlFor="loaiCoSoDangKy">Loại cơ sở đăng ký:</label><select id="loaiCoSoDangKy" name="loaiCoSoDangKy" value={farmData.loaiCoSoDangKy} onChange={handleChange} required><option value="">- Chọn loại cơ sở -</option><option value="Đăng ký cơ sở gây nuôi động vật">Cơ sở gây nuôi động vật</option><option value="Đăng ký cơ sở kinh doanh, chế biến gỗ">Cơ sở kinh doanh, chế biến gỗ</option></select></div>
                        <div className="form-group"><label htmlFor="trangThai">Trạng thái:</label><select id="trangThai" name="trangThai" value={farmData.trangThai} onChange={handleChange}><option value="">- Chọn trạng thái -</option><option value="Đang hoạt động">Đang hoạt động</option><option value="Đã đóng cửa">Đã đóng cửa</option><option value="Tạm ngưng">Tạm ngưng</option></select></div>
                        <div className="form-group"><label htmlFor="ghiChu">Ghi chú:</label><input type="text" id="ghiChu" name="ghiChu" value={farmData.ghiChu} onChange={handleChange} /></div>
                    </div>
                </section>

                <section className="khai-bao-section">
                    <h2>Người đại diện</h2>
                    <div className="form-grid">
                        <div className="form-group"><label htmlFor="tenNguoiDaiDien">Họ và tên:</label><input type="text" id="tenNguoiDaiDien" name="tenNguoiDaiDien" value={farmData.tenNguoiDaiDien} onChange={handleChange} required /></div>
                        <div className="form-group"><label htmlFor="namSinh">Năm sinh:</label><input type="number" id="namSinh" name="namSinh" value={farmData.namSinh} onChange={handleChange} /></div>
                        <div className="form-group"><label htmlFor="soCCCD">Số CCCD/Hộ chiếu:</label><input type="text" id="soCCCD" name="soCCCD" value={farmData.soCCCD} onChange={handleChange} required /></div>
                        <div className="form-group"><label htmlFor="ngayCapCCCD">Ngày cấp:</label><input type="date" id="ngayCapCCCD" name="ngayCapCCCD" value={farmData.ngayCapCCCD} onChange={handleChange} /></div>
                        <div className="form-group"><label htmlFor="noiCapCCCD">Nơi cấp:</label><input type="text" id="noiCapCCCD" name="noiCapCCCD" value={farmData.noiCapCCCD} onChange={handleChange} /></div>
                        <div className="form-group"><label htmlFor="soDienThoaiNguoiDaiDien">Số điện thoại:</label><input type="tel" id="soDienThoaiNguoiDaiDien" name="soDienThoaiNguoiDaiDien" value={farmData.soDienThoaiNguoiDaiDien} onChange={handleChange} /></div>
                        <div className="form-group"><label htmlFor="diaChiNguoiDaiDien">Địa chỉ:</label><input type="text" id="diaChiNguoiDaiDien" name="diaChiNguoiDaiDien" value={farmData.diaChiNguoiDaiDien} onChange={handleChange} /></div>
                    </div>
                </section>

                {farmData.loaiCoSoDangKy === 'Đăng ký cơ sở gây nuôi động vật' && (
                    <section className="khai-bao-section">
                        <h3>Thông tin Cơ sở gây nuôi</h3>
                        <div className="form-grid">
                            <div className="form-group"><label htmlFor="mucDichNuoi">Mục đích nuôi:</label><select id="mucDichNuoi" name="mucDichNuoi" value={farmData.mucDichNuoi} onChange={handleChange}><option value="">Chọn mục đích</option><option value="Nuôi thương mại">Nuôi thương mại</option><option value="Nuôi phi thương mại">Nuôi phi thương mại</option></select></div>
                            <div className="form-group"><label htmlFor="hinhThucNuoi">Hình thức nuôi:</label><select id="hinhThucNuoi" name="hinhThucNuoi" value={farmData.hinhThucNuoi} onChange={handleChange}><option value="">Chọn hình thức</option><option value="Sinh trưởng">Sinh trưởng</option><option value="Sinh sản">Sinh sản</option><option value="Sinh trưởng và sinh sản">Sinh trưởng và sinh sản</option></select></div>
                            <div className="form-group"><label htmlFor="maSoCoSoGayNuoi">Mã số cơ sở:</label><input type="text" id="maSoCoSoGayNuoi" name="maSoCoSoGayNuoi" value={farmData.maSoCoSoGayNuoi} onChange={handleChange} /></div>
                            <div className="form-group"><label htmlFor="tongDan">Tổng đàn:</label><input type="number" id="tongDan" name="tongDan" value={farmData.tongDan} onChange={handleChange} /></div>
                        </div>
                    </section>
                )}

                {farmData.loaiCoSoDangKy === 'Đăng ký cơ sở kinh doanh, chế biến gỗ' && (
                    <section className="khai-bao-section">
                        <h3>Thông tin Cơ sở kinh doanh, chế biến gỗ</h3>
                        <div className="form-grid">
                            <div className="form-group"><label htmlFor="loaiHinhKinhDoanhGo">Loại hình kinh doanh:</label><select id="loaiHinhKinhDoanhGo" name="loaiHinhKinhDoanhGo" value={farmData.loaiHinhKinhDoanhGo} onChange={handleChange}><option value="">Chọn loại hình</option><option value="Trại cưa">Trại cưa</option><option value="Trại mộc">Trại mộc</option><option value="Trang trí nội thất">Trang trí nội thất</option></select></div>
                            <div className="form-group"><label htmlFor="nganhNgheKinhDoanhGo">Ngành nghề:</label><select id="nganhNgheKinhDoanhGo" name="nganhNgheKinhDoanhGo" value={farmData.nganhNgheKinhDoanhGo} onChange={handleChange}><option value="">Chọn ngành nghề</option><option value="Thương mại">Thương mại</option><option value="Cưa gia công và mộc">Cưa gia công và mộc</option><option value="Chế biến mộc và thương mại">Chế biến mộc và thương mại</option></select></div>
                            <div className="form-group"><label htmlFor="khoiLuong">Khối lượng:</label><input type="text" id="khoiLuong" name="khoiLuong" value={farmData.khoiLuong} onChange={handleChange} /></div>
                        </div>
                    </section>
                )}

                {farmData.loaiCoSoDangKy && (
                    <section className="khai-bao-section">
                        <h3>Thông tin Loài</h3>
                        <div className="form-grid">
                            <div className="form-group"><label htmlFor="tenLamSan">Tên lâm sản:</label>{showManualSpeciesInput ? (<input type="text" id="tenLamSan" name="tenLamSan" value={farmData.tenLamSan} onChange={handleChange} placeholder="Nhập tên lâm sản" />) : (<select id="tenLamSan" name="tenLamSan" value={farmData.tenLamSan} onChange={handleChange}><option value="">Chọn tên lâm sản</option>{speciesOptions.map((opt, i) => (<option key={i} value={opt.tenLamSan}>{opt.tenLamSan}</option>))}<option value="Nhập thủ công">Loài khác (Nhập thủ công)</option></select>)}</div>
                            <div className="form-group"><label htmlFor="tenKhoaHoc">Tên khoa học:</label>{showManualSpeciesInput ? (<input type="text" id="tenKhoaHoc" name="tenKhoaHoc" value={farmData.tenKhoaHoc} onChange={handleChange} placeholder="Nhập tên khoa học" />) : (<input type="text" id="tenKhoaHoc" name="tenKhoaHoc" value={farmData.tenKhoaHoc} readOnly />)}</div>
                        </div>
                    </section>
                )}

                <section className="khai-bao-section">
                    <h3>Thông tin Giấy phép</h3>
                    <div className="form-grid">
                        <div className="form-group"><label htmlFor="giayPhepKinhDoanh">Số giấy phép kinh doanh:</label><input type="text" id="giayPhepKinhDoanh" name="giayPhepKinhDoanh" value={farmData.giayPhepKinhDoanh} onChange={handleChange} /></div>
                        <div className="form-group"><label htmlFor="issueDate">Ngày cấp:</label><input type="date" id="issueDate" name="issueDate" value={farmData.issueDate} onChange={handleChange} /></div>
                        <div className="form-group"><label htmlFor="expiryDate">Ngày hết hạn:</label><input type="date" id="expiryDate" name="expiryDate" value={farmData.expiryDate} onChange={handleChange} /></div>
                    </div>
                </section>

                <div className="form-actions">
                    <button type="submit" className="submit-button">Lưu thay đổi</button>
                    <button type="button" className="cancel-button" onClick={() => navigate(-1)}>Hủy</button>
                </div>
            </form>
        </div>
    );
}

export default FarmEditPage;
