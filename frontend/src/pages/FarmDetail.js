// src/pages/FarmDetail.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; // Tối ưu: Dùng context để nhất quán

// Import CSS
import './FormPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';
function calculateAnimalStats(animalProducts, activities) {

  return animalProducts.map(animal => {

    const speciesActivities = (activities || [])
      .filter(a => a.speciesName === animal.tenLamSan)
      .sort((a,b)=> new Date(a.date) - new Date(b.date));

    let parentsMale = 0;
    let parentsFemale = 0;

    let otherMale = 0;
    let otherFemale = 0;
    let otherUnknown = 0;

    speciesActivities.forEach(act => {

      parentsMale += (act.increase?.parents?.male || 0);
      parentsMale -= (act.decrease?.parents?.male || 0);

      parentsFemale += (act.increase?.parents?.female || 0);
      parentsFemale -= (act.decrease?.parents?.female || 0);

      otherMale += (act.increase?.otherIndividuals?.male || 0);
      otherMale -= (act.decrease?.otherIndividuals?.male || 0);

      otherFemale += (act.increase?.otherIndividuals?.female || 0);
      otherFemale -= (act.decrease?.otherIndividuals?.female || 0);

      otherUnknown += (act.increase?.otherIndividuals?.unidentified || 0);
      otherUnknown -= (act.decrease?.otherIndividuals?.unidentified || 0);

    });

    const total =
      parentsMale +
      parentsFemale +
      otherMale +
      otherFemale +
      otherUnknown;

    return {
      ...animal,
      danSo:{
        danBoMe:{ duc:parentsMale, cai:parentsFemale },
        Cathekhac:{
          duc:otherMale,
          cai:otherFemale,
          cxđ:otherUnknown
        },
        tongDan:total
      }
    };

  });

}
function buildHistoryTimeline(activities) {

  let bmDuc = 0;
  let bmCai = 0;

  let ctkDuc = 0;
  let ctkCai = 0;
  let cxd = 0;

  return activities.map((a, index) => {

    bmDuc = Math.max(
      0,
      bmDuc +
        (a.increase?.parents?.male || 0) -
        (a.decrease?.parents?.male || 0)
    );

    bmCai = Math.max(
      0,
      bmCai +
        (a.increase?.parents?.female || 0) -
        (a.decrease?.parents?.female || 0)
    );

    ctkDuc = Math.max(
      0,
      ctkDuc +
        (a.increase?.otherIndividuals?.male || 0) -
        (a.decrease?.otherIndividuals?.male || 0)
    );

    ctkCai = Math.max(
      0,
      ctkCai +
        (a.increase?.otherIndividuals?.female || 0) -
        (a.decrease?.otherIndividuals?.female || 0)
    );

    cxd = Math.max(
      0,
      cxd +
        (a.increase?.otherIndividuals?.unidentified || 0) -
        (a.decrease?.otherIndividuals?.unidentified || 0)
    );

    const tong =
      bmDuc +
      bmCai +
      ctkDuc +
      ctkCai +
      cxd;

    return {
      ...a,
      stt: index + 1,
      tong,
      bmDuc,
      bmCai,
      ctkDuc,
      ctkCai,
      cxd
    };

  });

}
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
	// State cho loài đang chọn
const [selectedAnimal, setSelectedAnimal] = useState(null);

    // State cho trạng thái UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // State cho form nhập liệu hoạt động
   const [activityFormData, setActivityFormData] = useState({
  speciesName: '',
  date: '',
  currentStatus: {
    parents: { male: 0, female: 0 },
    otherIndividuals: { male: 0, female: 0, unidentified: 0 }
  },
  increase: {
    parents: { male: 0, female: 0 },
    otherIndividuals: { male: 0, female: 0, unidentified: 0 }
  },
  decrease: {
    parents: { male: 0, female: 0 },
    otherIndividuals: { male: 0, female: 0, unidentified: 0 }
  },
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
            const sortedActivities = (activitiesRes.data || []).sort(
  (a,b) => new Date(a.date) - new Date(b.date)
);

setActivities(sortedActivities);

// rebuild thống kê từ activity mới nhất
const updatedAnimals = (details.animalProducts || []).map(animal => {

  const speciesActivities = sortedActivities.filter(
    a => a.speciesName?.trim() === animal.tenLamSan?.trim()
  );

  if (speciesActivities.length === 0) return animal;

  const last = speciesActivities[speciesActivities.length - 1];

  const status = last.currentStatus || {
    parents:{male:0,female:0},
    otherIndividuals:{male:0,female:0,unidentified:0}
  };

  const total =
    status.parents.male +
    status.parents.female +
    status.otherIndividuals.male +
    status.otherIndividuals.female +
    status.otherIndividuals.unidentified;

  return {
    ...animal,
    danSo:{
      danBoMe:{
        duc: status.parents.male,
        cai: status.parents.female
      },
      Cathekhac:{
        duc: status.otherIndividuals.male,
        cai: status.otherIndividuals.female,
        cxđ: status.otherIndividuals.unidentified
},
      duoiMotTuoi: status.otherIndividuals.unidentified,
      tongDan: total
    }
  };

});

setFarm({
  ...details,
  animalProducts: updatedAnimals
});

            // Cập nhật speciesName mặc định cho form
            const defaultAnimal = updatedAnimals?.[0] || null;
			setActivityFormData(prev => ({...prev, speciesName: defaultAnimal?.tenLamSan || ''
}));

setSelectedAnimal(defaultAnimal);

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

    // 1. Xử lý chọn loài (giữ nguyên logic của bạn)
    if (name === 'speciesName') {
        const animal = farm?.animalProducts?.find(a => a.tenLamSan === value);
        setSelectedAnimal(animal);
        setActivityFormData(prev => ({ ...prev, speciesName: value }));
        return;
    }

    // 2. Xử lý các trường lồng nhau (increase.parents.male, ...)
    const keys = name.split('.');
    
    setActivityFormData(prev => {
        let newData = { ...prev };
        
        if (keys.length === 1) {
            newData[name] = value;
        } else if (keys.length === 3) {
            const [section, group, field] = keys;
            newData[section] = {
                ...prev[section],
                [group]: {
                    ...prev[section][group],
                    [field]: Math.max(0, Number(value)) // Đảm bảo không nhập số âm
                }
            };
        }
        return newData;
    });
};

   const handleAddActivity = async (e) => {
  e.preventDefault();
  setMessage('');
  try {
   	// Lấy activity theo loài
const speciesActivities = activities
  .filter(a => a.speciesName?.trim() === activityFormData.speciesName?.trim())
  .sort((a,b) => new Date(a.date) - new Date(b.date));

// bản ghi gần nhất của loài
const lastActivity =
  speciesActivities.length > 0
    ? speciesActivities[speciesActivities.length - 1]
    : null;

const prevStatus = lastActivity?.currentStatus || {
  parents: { male: 0, female: 0 },
  otherIndividuals: { male: 0, female: 0, unidentified: 0 }
};
	if (lastActivity && new Date(activityFormData.date) < new Date(lastActivity.date)) {
  setError("Ngày ghi nhận phải sau bản ghi trước.");
  return;
}

    // TÍNH HIỆN TRẠNG MỚI
	if (
  activityFormData.decrease.parents.male > prevStatus.parents.male ||
  activityFormData.decrease.parents.female > prevStatus.parents.female ||
  activityFormData.decrease.otherIndividuals.male > prevStatus.otherIndividuals.male ||
  activityFormData.decrease.otherIndividuals.female > prevStatus.otherIndividuals.female ||
  activityFormData.decrease.otherIndividuals.unidentified > prevStatus.otherIndividuals.unidentified
) {
  setError("Số lượng giảm vượt quá số lượng hiện có.");
  return;
}
    const newStatus = {
      parents: {
        male:
          prevStatus.parents.male +
          activityFormData.increase.parents.male -
          activityFormData.decrease.parents.male,

        female:
          prevStatus.parents.female +
          activityFormData.increase.parents.female -
          activityFormData.decrease.parents.female
      },

      otherIndividuals: {
        male:
          prevStatus.otherIndividuals.male +
          activityFormData.increase.otherIndividuals.male -
          activityFormData.decrease.otherIndividuals.male,

        female:
          prevStatus.otherIndividuals.female +
          activityFormData.increase.otherIndividuals.female -
          activityFormData.decrease.otherIndividuals.female,

        unidentified:
          prevStatus.otherIndividuals.unidentified +
          activityFormData.increase.otherIndividuals.unidentified -
          activityFormData.decrease.otherIndividuals.unidentified
      }
    };

    // TÍNH TỔNG ĐÀN
    const totalIndividuals =
      newStatus.parents.male +
      newStatus.parents.female +
      newStatus.otherIndividuals.male +
      newStatus.otherIndividuals.female +
      newStatus.otherIndividuals.unidentified;
	// chặn tổng đàn âm
	if (totalIndividuals < 0) {
  setError("Tổng đàn không hợp lệ (âm). Vui lòng kiểm tra lại số lượng tăng/giảm.");
  return;
}
    const dataToSend = {
      ...activityFormData,
      currentStatus: newStatus,
      totalIndividuals,
      farm: farmId
    };
 
    const res = await axios.post(
      `${API_BASE_URL}/api/farm-activities`,
      dataToSend,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // update bảng activity
    const updatedActivities = [...activities, res.data].sort(
  (a,b) => new Date(a.date) - new Date(b.date)
);

setActivities(updatedActivities);

const updatedAnimals = calculateAnimalStats(
  farm.animalProducts,
  updatedActivities
);

setFarm(prev => ({
  ...prev,
  animalProducts: updatedAnimals
}));

setSelectedAnimal(
  updatedAnimals.find(a => a.tenLamSan === activityFormData.speciesName)
);



    setMessage('Thêm bản ghi thành công');
setActivityFormData(prev => ({
  ...prev,
  date: '',
  increase:{
    parents:{male:0,female:0},
    otherIndividuals:{male:0,female:0,unidentified:0}
  },
  decrease:{
    parents:{male:0,female:0},
    otherIndividuals:{male:0,female:0,unidentified:0}
  },
  reasonForChange:'',
  verifiedBy:''
}));
  } catch (err) {
    console.error(err);
    setError('Lỗi khi thêm bản ghi');
  }
};
const handleDeleteActivity = useCallback(async (activityId) => {

  if (!window.confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) return;

  try {

    await axios.delete(
      `${API_BASE_URL}/api/farm-activities/${activityId}`,
      { headers:{ Authorization:`Bearer ${token}` }}
    );

    const updatedActivities = activities.filter(a => a._id !== activityId);
    setActivities(updatedActivities);

    const updatedAnimals = calculateAnimalStats(
      farm.animalProducts,
      updatedActivities
    );

    setFarm(prev => ({
      ...prev,
      animalProducts: updatedAnimals
    }));

    setSelectedAnimal(
      updatedAnimals.find(a => a.tenLamSan === activityFormData.speciesName)
    );

    setMessage("Đã xóa bản ghi");

  } catch(err) {

    setError("Xóa thất bại");

  }

}, [activities, farm, token, activityFormData.speciesName]);
// 🔥 TỰ UPDATE BẢNG THỐNG KÊ
  useEffect(() => {

    if (!farm) return;

    const updatedAnimals = calculateAnimalStats(
      farm.animalProducts || [],
      activities || []
    );

    setFarm(prev => ({
      ...prev,
      animalProducts: updatedAnimals
    }));

  }, [activities]);
  useEffect(() => {

  if (!farm || !activityFormData.speciesName) return;

  const animal = farm.animalProducts?.find(
    a => a.tenLamSan === activityFormData.speciesName
  );

  if (animal) {
    setSelectedAnimal(animal);
  }

}, [farm, activityFormData.speciesName]);

    // === PHẦN HIỂN THỊ (RENDER) ===
	// Thêm logic lọc:
	const filteredActivities = (activities || []).filter(
  (act) => act.speciesName?.trim() === activityFormData.speciesName?.trim()
);
    if (loading) return <div className="form-container"><p>Đang tải dữ liệu...</p></div>;
    if (error) return <div className="form-container"><p style={{ color: 'red' }}>Lỗi: {error}</p></div>;
    if (!farm) return <div className="form-container"><p>Không tìm thấy thông tin cơ sở.</p></div>;

    return (
        <div className="form-container">
            <style>{`
                /* Giữ nguyên các style của bạn */
            `}</style>
            <h2 className="farm-title">📒 Sổ theo dõi: <strong>{farm.tenCoSo}</strong> (Địa chỉ: {farm.diaChiCoSo?.trim()}, {farm.communeName}, {farm.provinceName})</h2>
			<div className="form-grid">
            
						  {/* CỘT TRÁI */}
 			 <div className="selection-box">
 			   <label className="label-title">Tên loài:</label>
			    <select
 			     className="custom-select"
 			     name="speciesName"
 			     value={activityFormData.speciesName}
 			     onChange={handleActivityFormChange}
 			     required
			    >
			      <option value="">=> Chọn loài</option>
			      {farm.animalProducts?.map((species) => (
 			       <option key={species._id} value={species.tenLamSan}>
 			         {species.tenLamSan}
			        </option>
 			     ))}
 			   </select>
			  </div>

			  {/* CỘT PHẢI */}
			  {selectedAnimal && (
			    <div className="stats-box">
			      <div className="stats-header">
			        📊 Thống kê loài đã đăng ký
 			     </div>
			      <div className="table-wrapper">
 			       <table className="modern-table">
 			         <thead>
  			          <tr>
              <th>Tên loài</th>
              <th>Tên khoa học</th>
              <th>Bố mẹ đực</th>
              <th>Bố mẹ cái</th>
              <th>Cá thể khác (đực)</th>
              <th>Cá thể khác (cái)</th>
              <th>Cá thể khác (cxđ)</th>
              <th>Tổng đàn</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{selectedAnimal.tenLamSan}</td>
              <td className="italic">{selectedAnimal.tenKhoaHoc}</td>
              <td>{selectedAnimal.danSo?.danBoMe?.duc ?? 0}</td>
              <td>{selectedAnimal.danSo?.danBoMe?.cai ?? 0}</td>
              <td>{selectedAnimal.danSo?.Cathekhac?.duc ?? 0}</td>
              <td>{selectedAnimal.danSo?.Cathekhac?.cai ?? 0}</td>
              <td>{selectedAnimal.danSo?.Cathekhac?.cxđ ?? 0}</td>
              <td className="total">{selectedAnimal.danSo?.tongDan ?? 0}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  )}

</div>
            <h3>⚡Thêm bản ghi theo dõi mới:</h3>
            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleAddActivity} className="modern-form">
                <div className="form-grid-2">
                    <div className="form-group">
                        <label>Ngày ghi nhận:</label>
                        <input type="date" name="date" value={activityFormData.date} onChange={handleActivityFormChange} required />
                    </div>
                    <div className="form-group">
                        <label>Lý do thay đổi:</label>
                        <input type="text" name="reasonForChange" value={activityFormData.reasonForChange} onChange={handleActivityFormChange} />
                    </div>
					<div className="form-group">
					    <label>Người xác nhận:</label>
 					   <input
					        type="text"
					        name="verifiedBy"
					        value={activityFormData.verifiedBy}
 					       onChange={handleActivityFormChange}
 					   />
					</div>
                </div>
                <div className="form-grid-tanggiam">
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
                                <h5>Cá thể khác:</h5>
                                <div className="form-section-row">
                                    <div className="form-group"><label>Đực:</label><input type="number" name="increase.otherIndividuals.male" value={activityFormData.increase.otherIndividuals.male} onChange={handleActivityFormChange} min="0" /></div>
                                    <div className="form-group"><label>Cái:</label><input type="number" name="increase.otherIndividuals.female" value={activityFormData.increase.otherIndividuals.female} onChange={handleActivityFormChange} min="0" /></div>
                                    <div className="form-group"><label>Chưa xác định:</label><input type="number" name="increase.otherIndividuals.unidentified" value={activityFormData.increase.otherIndividuals.unidentified} onChange={handleActivityFormChange} min="0" /></div>
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
                                <h5>Cá thể khác:</h5>
                                <div className="form-section-row">
                                    <div className="form-group"><label>Đực:</label><input type="number" name="decrease.otherIndividuals.male" value={activityFormData.decrease.otherIndividuals.male} onChange={handleActivityFormChange} min="0" /></div>
                                    <div className="form-group"><label>Cái:</label><input type="number" name="decrease.otherIndividuals.female" value={activityFormData.decrease.otherIndividuals.female} onChange={handleActivityFormChange} min="0" /></div>
                                    <div className="form-group"><label>Chưa xác định:</label><input type="number" name="decrease.otherIndividuals.unidentified" value={activityFormData.decrease.otherIndividuals.unidentified} onChange={handleActivityFormChange} min="0" /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <button type="submit" className="submit-button">Thêm bản ghi</button>
            </form>

            <h3>📈 Lịch sử theo dõi:</h3>
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
                                <th colSpan="3">Cá thể khác</th>
                                <th colSpan="5">Tăng</th>
                                <th colSpan="5">Giảm</th>
                            </tr>
                            <tr>
                                <th>Đực</th><th>Cái</th>
                                <th>Đực</th><th>Cái</th><th>Chưa biết</th>
                                <th>Đực (BM)</th><th>Cái (BM)</th><th>Đực (CTK)</th><th>Cái (CTK)</th><th>Cxđ (CTK)</th>
                                <th>Đực (BM)</th><th>Cái (BM)</th><th>Đực (CTK)</th><th>Cái (CTK)</th><th>Cxđ (CTK)</th>
                            </tr>
                        </thead>
                        <tbody>
                               {buildHistoryTimeline(filteredActivities).map((activity) => (
								<tr key={activity._id}>
								<td>{activity.stt}</td>
                                    <td>{activity.date ? new Date(activity.date).toLocaleDateString() : 'N/A'}</td>
                                    <td>{activity.tong ?? 0}</td>
                                    <td>{activity.bmDuc}</td>
                                    <td>{activity.bmCai}</td>
                                    <td>{activity.ctkDuc}</td>
                                    <td>{activity.ctkCai}</td>
                                    <td>{activity.cxd}</td>
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
