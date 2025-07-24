import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Để lấy farmId từ URL
import axios from 'axios';
import './FormPage.css'; // Sử dụng lại CSS cho form
import './Manager.css'; // Sử dụng lại CSS cho bảng

function FarmDetail() {
  const { farmId } = useParams(); // Lấy farmId từ URL
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const [farm, setFarm] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // State cho form nhập bản ghi theo dõi
  const [activityFormData, setActivityFormData] = useState({
    speciesName: '',
    date: '',
    totalIndividuals: 0,
    currentStatus: { parents: { total: 0, male: 0, female: 0, unidentified: 0 }, otherIndividuals: { total: 0, male: 0, female: 0, unidentified: 0 } },
    increase: { parents: { total: 0, male: 0, female: 0, unidentified: 0 }, otherIndividuals: { total: 0, male: 0, female: 0, unidentified: 0 } },
    decrease: { parents: { total: 0, male: 0, female: 0, unidentified: 0 }, otherIndividuals: { total: 0, male: 0, female: 0, unidentified: 0 } },
    reasonForChange: '',
    verifiedBy: '',
  });

  // Hàm fetch chi tiết cơ sở gây nuôi và các bản ghi theo dõi
  const fetchFarmDetails = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const resFarm = await axios.get(`${process.env.REACT_APP_API_URL}/api/farms/${farmId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFarm(resFarm.data);

      const resActivities = await axios.get(`${process.env.REACT_APP_API_URL}/api/farm-activities/${farmId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActivities(resActivities.data);
    } catch (err) {
      console.error('Error fetching farm details or activities:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Không thể tải chi tiết cơ sở gây nuôi hoặc các bản ghi theo dõi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmDetails();
  }, [farmId, token]); // Thêm token vào dependency array nếu nó có thể thay đổi (dù ít khi xảy ra)

  const handleActivityFormChange = (e) => {
    const { name, value } = e.target;
    // Xử lý các trường đơn giản trực tiếp
    if (['speciesName', 'date', 'totalIndividuals', 'reasonForChange', 'verifiedBy'].includes(name)) {
      setActivityFormData(prevData => ({
        ...prevData,
        [name]: name === 'totalIndividuals' ? parseInt(value, 10) || 0 : value, // Chuyển đổi sang số nguyên
      }));
    } else {
      // Xử lý các trường nested (currentStatus, increase, decrease)
      const [mainField, subField, prop] = name.split('.'); // vd: currentStatus.parents.total
      setActivityFormData(prevData => ({
        ...prevData,
        [mainField]: {
          ...prevData[mainField],
          [subField]: {
            ...prevData[mainField][subField],
            [prop]: parseInt(value, 10) || 0, // Chuyển đổi sang số nguyên
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
      // Đảm bảo farmId được gửi cùng với dữ liệu form
      const dataToSend = {
        ...activityFormData,
        farm: farmId,
      };
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/farm-activities`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Thêm bản ghi theo dõi thành công!');
      // Cập nhật lại danh sách activities
      setActivities(prevActivities => [...prevActivities, res.data]);
      // Reset form
      setActivityFormData({
        speciesName: '',
        date: '',
        totalIndividuals: 0,
        currentStatus: { parents: { total: 0, male: 0, female: 0, unidentified: 0 }, otherIndividuals: { total: 0, male: 0, female: 0, unidentified: 0 } },
        increase: { parents: { total: 0, male: 0, female: 0, unidentified: 0 }, otherIndividuals: { total: 0, male: 0, female: 0, unidentified: 0 } },
        decrease: { parents: { total: 0, male: 0, female: 0, unidentified: 0 }, otherIndividuals: { total: 0, male: 0, female: 0, unidentified: 0 } },
        reasonForChange: '',
        verifiedBy: '',
      });
    } catch (err) {
      console.error('Error adding activity:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Lỗi khi thêm bản ghi theo dõi.');
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) {
      setMessage('');
      setError('');
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/farm-activities/${activityId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage('Bản ghi đã được xóa thành công.');
        // Cập nhật lại danh sách activities sau khi xóa
        setActivities(prevActivities => prevActivities.filter(act => act._id !== activityId));
      } catch (err) {
        console.error('Error deleting activity:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Lỗi khi xóa bản ghi theo dõi.');
      }
    }
  };


  if (loading) {
    return <div className="loading-message">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="error-message">Lỗi: {error}</div>;
  }

  if (!farm) {
    return <div className="info-message">Không tìm thấy thông tin cơ sở gây nuôi.</div>;
  }

  return (
    <div className="form-page-container">
      <h2>Chi tiết cơ sở gây nuôi: {farm.name}</h2>
      <p><strong>Mã số cấp phép:</strong> {farm.licenseNumber}</p>
      <p><strong>Loại hình:</strong> {farm.type}</p>
      <p><strong>Chủ cơ sở:</strong> {farm.ownerName}</p>
      <p><strong>Địa chỉ:</strong> {farm.address}</p>
      <p><strong>Điện thoại:</strong> {farm.phoneNumber}</p>
      <p><strong>Ngày cấp phép:</strong> {farm.issueDate ? new Date(farm.issueDate).toLocaleDateString() : 'N/A'}</p>
      <p><strong>Ngày hết hạn:</strong> {farm.expiryDate ? new Date(farm.expiryDate).toLocaleDateString() : 'N/A'}</p>
      <p><strong>Trạng thái hoạt động:</strong> {farm.status}</p>

      <h3>Danh sách loài gây nuôi hiện tại:</h3>
      {farm.species && farm.species.length > 0 ? (
        <ul className="species-list">
          {farm.species.map((s, idx) => (
            <li key={idx}>{s.name} (Số lượng: {s.quantity})</li>
          ))}
        </ul>
      ) : (
        <p>Chưa có thông tin loài gây nuôi.</p>
      )}

      <h3>Thêm bản ghi theo dõi mới:</h3>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleAddActivity} className="modern-form">
        <label>
          Tên loài:
          <input
            type="text"
            name="speciesName"
            value={activityFormData.speciesName}
            onChange={handleActivityFormChange}
            required
          />
        </label>
        <label>
          Ngày ghi nhận:
          <input
            type="date"
            name="date"
            value={activityFormData.date}
            onChange={handleActivityFormChange}
            required
          />
        </label>
        <label>
          Tổng số cá thể:
          <input
            type="number"
            name="totalIndividuals"
            value={activityFormData.totalIndividuals}
            onChange={handleActivityFormChange}
            min="0"
            required
          />
        </label>

        <h4>Hiện trạng nuôi:</h4>
        <div className="form-section">
          <h5>Bố mẹ:</h5>
          <label>Tổng:
            <input type="number" name="currentStatus.parents.total" value={activityFormData.currentStatus.parents.total} onChange={handleActivityFormChange} min="0" />
          </label>
          <label>Đực:
            <input type="number" name="currentStatus.parents.male" value={activityFormData.currentStatus.parents.male} onChange={handleActivityFormChange} min="0" />
          </label>
          <label>Cái:
            <input type="number" name="currentStatus.parents.female" value={activityFormData.currentStatus.parents.female} onChange={handleActivityFormChange} min="0" />
          </label>
          <label>Không rõ:
            <input type="number" name="currentStatus.parents.unidentified" value={activityFormData.currentStatus.parents.unidentified} onChange={handleActivityFormChange} min="0" />
          </label>
        </div>
        <div className="form-section">
          <h5>Cá thể khác:</h5>
          <label>Tổng:
            <input type="number" name="currentStatus.otherIndividuals.total" value={activityFormData.currentStatus.otherIndividuals.total} onChange={handleActivityFormChange} min="0" />
          </label>
          <label>Đực:
            <input type="number" name="currentStatus.otherIndividuals.male" value={activityFormData.currentStatus.otherIndividuals.male} onChange={handleActivityFormChange} min="0" />
          </label>
          <label>Cái:
            <input type="number" name="currentStatus.otherIndividuals.female" value={activityFormData.currentStatus.otherIndividuals.female} onChange={handleActivityFormChange} min="0" />
          </label>
          <label>Không rõ:
            <input type="number" name="currentStatus.otherIndividuals.unidentified" value={activityFormData.currentStatus.otherIndividuals.unidentified} onChange={handleActivityFormChange} min="0" />
          </label>
        </div>

        <h4>Tăng đàn:</h4>
        <div className="form-section">
          <h5>Bố mẹ:</h5>
          <label>Tổng:
            <input type="number" name="increase.parents.total" value={activityFormData.increase.parents.total} onChange={handleActivityFormChange} min="0" />
          </label>
          <label>Đực:
            <input type="number" name="increase.parents.male" value={activityFormData.increase.parents.male} onChange={handleActivityFormChange} min="0" />
          </label>
          <label>Cái:
            <input type="number" name="increase.parents.female" value={activityFormData.increase.parents.female} onChange={handleActivityFormChange} min="0" />
          </label>
          <label>Không rõ:
            <input type="number" name="increase.parents.unidentified" value={activityFormData.increase.parents.unidentified} onChange={handleActivityFormChange} min="0" />
          </label>
        </div>
        <div className="form-section">
          <h5>Cá thể khác:</h5>
          <label>Tổng:
            <input type="number" name="increase.otherIndividuals.total" value={activityFormData.increase.otherIndividuals.total} onChange={handleActivityFormChange} min="0" />
          </label>
          <label>Đực:
            <input type="number" name="increase.otherIndividuals.male" value={activityFormData.increase.otherIndividuals.male} onChange={handleActivityFormChange} min="0" />
          </label>
          <label>Cái:
            <input type="number" name="increase.otherIndividuals.female" value={activityFormData.increase.otherIndividuals.female} onChange={handleActivityFormChange} min="0" />
          </label>
          <label>Không rõ:
            <input type="number" name="increase.otherIndividuals.unidentified" value={activityFormData.increase.otherIndividuals.unidentified} onChange={handleActivityFormChange} min="0" />
          </label>
        </div>

        <h4>Giảm đàn:</h4>
        <div className="form-section">
          <h5>Bố mẹ:</h5>
          <label>Tổng:
            <input type="number" name="decrease.parents.total" value={activityFormData.decrease.parents.total} onChange={handleActivityFormChange} min="0" />
          </label>
          <label>Đực:
            <input type="number" name="decrease.parents.male" value={activityFormData.decrease.parents.male} onChange={handleActivityFormChange} min="0" />
          </label>
          <label>Cái:
            <input type="number" name="decrease.parents.female" value={activityFormData.decrease.parents.female} onChange={handleActivityFormChange} min="0" />
          </label>
          <label>Không rõ:
            <input type="number" name="decrease.parents.unidentified" value={activityFormData.decrease.parents.unidentified} onChange={handleActivityFormChange} min="0" />
          </label>
        </div>
        <div className="form-section">
          <h5>Cá thể khác:</h5>
          <label>Tổng:
            <input type="number" name="decrease.otherIndividuals.total" value={activityFormData.decrease.otherIndividuals.total} onChange={handleActivityFormChange} min="0" />
          </label>
          <label>Đực:
            <input type="number" name="decrease.otherIndividuals.male" value={activityFormData.decrease.otherIndividuals.male} onChange={handleActivityFormChange} min="0" />
          </label>
          <label>Cái:
            <input type="number" name="decrease.otherIndividuals.female" value={activityFormData.decrease.otherIndividuals.female} onChange={handleActivityFormChange} min="0" />
          </label>
          <label>Không rõ:
            <input type="number" name="decrease.otherIndividuals.unidentified" value={activityFormData.decrease.otherIndividuals.unidentified} onChange={handleActivityFormChange} min="0" />
          </label>
        </div>

        <label>
          Nguyên nhân biến động:
          <input
            type="text"
            name="reasonForChange"
            value={activityFormData.reasonForChange}
            onChange={handleActivityFormChange}
          />
        </label>
        <label>
          Xác nhận bởi:
          <input
            type="text"
            name="verifiedBy"
            value={activityFormData.verifiedBy}
            onChange={handleActivityFormChange}
          />
        </label>
        <button type="submit" className="submit-button">Thêm bản ghi</button>
      </form>

      <h3>Lịch sử theo dõi biến động:</h3>
      <div className="activity-list-container">
        {activities.length === 0 ? (
          <p>Chưa có bản ghi theo dõi nào cho cơ sở này.</p>
        ) : (
          activities.map(activity => (
            <div key={activity?._id || `temp-key-${Math.random()}`} className="activity-item">
              <h4>Bản ghi ngày: {activity?.date ? new Date(activity.date).toLocaleDateString() : 'N/A'}</h4>
              <p><strong>Loài:</strong> {activity?.speciesName ?? 'N/A'}</p>
              <p><strong>Tổng số cá thể:</strong> {activity?.totalIndividuals ?? 0}</p>

              <h5>Hiện trạng nuôi:</h5>
              <p><strong>Bố mẹ:</strong> Tổng: {activity.currentStatus?.parents?.total ?? 0}, Đực: {activity.currentStatus?.parents?.male ?? 0}, Cái: {activity.currentStatus?.parents?.female ?? 0}, Không rõ: {activity.currentStatus?.parents?.unidentified ?? 0}</p>
              <p><strong>Cá thể khác:</strong> Tổng: {activity.currentStatus?.otherIndividuals?.total ?? 0}, Đực: {activity.currentStatus?.otherIndividuals?.male ?? 0}, Cái: {activity.currentStatus?.otherIndividuals?.female ?? 0}, Không rõ: {activity.currentStatus?.otherIndividuals?.unidentified ?? 0}</p>

              <h5>Tăng đàn:</h5>
              <p><strong>Bố mẹ:</strong> Tổng: {activity.increase?.parents?.total ?? 0}, Đực: {activity.increase?.parents?.male ?? 0}, Cái: {activity.increase?.parents?.female ?? 0}, Không rõ: {activity.increase?.parents?.unidentified ?? 0}</p>
              <p><strong>Cá thể khác:</strong> Tổng: {activity.increase?.otherIndividuals?.total ?? 0}, Đực: {activity.increase?.otherIndividuals?.male ?? 0}, Cái: {activity.increase?.otherIndividuals?.female ?? 0}, Không rõ: {activity.increase?.otherIndividuals?.unidentified ?? 0}</p>

              <h5>Giảm đàn:</h5>
              <p><strong>Bố mẹ:</strong> Tổng: {activity.decrease?.parents?.total ?? 0}, Đực: {activity.decrease?.parents?.male ?? 0}, Cái: {activity.decrease?.parents?.female ?? 0}, Không rõ: {activity.decrease?.parents?.unidentified ?? 0}</p>
              <p><strong>Cá thể khác:</strong> Tổng: {activity.decrease?.otherIndividuals?.total ?? 0}, Đực: {activity.decrease?.otherIndividuals?.male ?? 0}, Cái: {activity.decrease?.otherIndividuals?.female ?? 0}, Không rõ: {activity.decrease?.otherIndividuals?.unidentified ?? 0}</p>

              <p><strong>Nguyên nhân biến động:</strong> {activity?.reasonForChange ?? 'N/A'}</p>
              <p><strong>Xác nhận bởi:</strong> {activity?.verifiedBy ?? 'N/A'}</p>
              {role === 'admin' && (
                <button onClick={() => handleDeleteActivity(activity._id)} className="delete-button">Xóa bản ghi</button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default FarmDetail;