// src/pages/FarmDetail.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Dashboard.css';
import './FormPage.css'; // Reuse CSS for forms
import './Manager.css'; // Reuse CSS for tables (if you have specific table styles for activities)

function FarmDetail() {
  const { farmId } = useParams(); // Get farmId from URL
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role'); // Get user role to check permissions

  const [farm, setFarm] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // State for the activity tracking form
  const [activityFormData, setActivityFormData] = useState({
    speciesName: '', // Species name - now selected from a dropdown at the top
    date: '',        // Date recorded
    totalIndividuals: 0, // Total individuals - This value will no longer be entered via the UI form
    currentStatus: { // currentStatus is still kept in state to send to the backend
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
    verifiedBy: '', // This field will no longer be entered via the UI form
  });

  // Function to fetch farm details and tracking records
  const fetchFarmDetails = useCallback(async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      // Get farm details
      const resFarm = await axios.get(`http://localhost:10000/api/farms/${farmId}`, { // Giữ cổng 10000 như bạn yêu cầu
        headers: { Authorization: `Bearer ${token}` },
      });
      setFarm(resFarm.data);

      // CẬP NHẬT LOGIC LẤY TÊN LÂM SẢN (speciesName) TỪ loaiDongVatRung
      // Đảm bảo resFarm.data.loaiDongVatRung tồn tại và là một mảng
      if (resFarm.data.loaiDongVatRung && Array.isArray(resFarm.data.loaiDongVatRung) && resFarm.data.loaiDongVatRung.length > 0) {
        setActivityFormData(prev => ({
          ...prev,
          speciesName: resFarm.data.loaiDongVatRung[0].tenLamSan // Lấy tenLamSan từ phần tử đầu tiên
        }));
      } else {
        // Nếu loaiDongVatRung không có hoặc rỗng, có thể kiểm tra tenLamSan trực tiếp (nếu nó là một trường riêng)
        if (resFarm.data.tenLamSan) { // Nếu farm có trường tenLamSan trực tiếp
            setActivityFormData(prev => ({
                ...prev,
                speciesName: resFarm.data.tenLamSan
            }));
        }
      }

      // Get activity tracking records for this farm
      const resActivities = await axios.get(`http://localhost:10000/api/farm-activities/${farmId}`, { // Giữ cổng 10000
        headers: { Authorization: `Bearer ${token}` },
      });
      setActivities(resActivities.data);

    } catch (err) {
      console.error('Error loading farm details or tracking records:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Could not load farm details or tracking records.');
      if (err.response && (err.response.status === 401 || err.response.status === 403 || err.response.status === 404)) {
        navigate('/admin/farms');
      }
    } finally {
      setLoading(false);
    }
  }, [farmId, token, navigate]);

  useEffect(() => {
    console.log("FarmDetail.js: useEffect is running!");
    if (farmId && token) {
      fetchFarmDetails();
    } else if (!farmId) {
      setError('No farm ID to view details.');
      setLoading(false);
    } else if (!token) {
      setError('You need to log in to view farm details.');
      setLoading(false);
      navigate('/');
    }
  }, [farmId, token, navigate, fetchFarmDetails]);

  const handleActivityFormChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...activityFormData };

    if (['speciesName', 'date', 'reasonForChange'].includes(name)) {
      newFormData = {
        ...newFormData,
        [name]: value,
      };
    }
    else {
      const [mainField, subField, prop] = name.split('.');
      newFormData = {
        ...newFormData,
        [mainField]: {
          ...newFormData[mainField],
          [subField]: {
            ...newFormData[mainField][subField],
            [prop]: parseInt(value, 10) || 0,
          },
        },
      };
    }
    setActivityFormData(newFormData);
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const dataToSend = {
        ...activityFormData,
        farm: farmId,
      };
      const res = await axios.post(`http://localhost:10000/api/farm-activities`, dataToSend, { // Giữ cổng 10000
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Tracking record added successfully!');
      setActivities(prevActivities => [...prevActivities, res.data]);
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
      console.error('Error adding tracking record:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error adding tracking record.');
    }
  };

  const handleDeleteActivity = async (activityId) => {
    const confirmed = window.confirm('Are you sure you want to delete this record?');
    if (confirmed) {
      setMessage('');
      setError('');
      try {
        await axios.delete(`http://localhost:10000/api/farm-activities/${activityId}`, { // Giữ cổng 10000
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage('Record deleted successfully.');
        setActivities(prevActivities => prevActivities.filter(act => act._id !== activityId));
      } catch (err) {
        console.error('Error deleting tracking record:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Error deleting tracking record.');
      }
    }
  };


  if (loading) {
    return <div className="form-container"><p>Loading data...</p></div>;
  }

  if (error) {
    return (
      <div className="form-container">
        <p style={{ color: 'red' }}>Error: {error}</p>
        <button onClick={() => navigate('/admin/farms')}>Back to list</button>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="form-container">
        <p style={{ color: 'orange' }}>No farm information found.</p>
        <button onClick={() => navigate('/admin/farms')}>Back to list</button>
      </div>
    );
  }

  return (
    <div className="form-container">
      <style>
        {`
        .form-section-wrapper {
          flex: 1; /* Ensure Increase/Decrease sections share space evenly */
          min-width: 300px; /* Prevent them from becoming too small on narrow screens */
          padding: 3px; /* Reduce padding to decrease spacing */
          box-sizing: border-box; /* Ensure padding doesn't increase overall size */
        }

        .form-section-row {
          display: flex;
          gap: 15px; /* Reduce spacing between inputs in the same row */
          margin-bottom: 3px; /* Reduce spacing between rows */
          align-items: center;
        }

        /* Adjust input within form-group so they don't become too small */
        .form-group input[type="number"],
        .form-group input[type="text"],
        .form-group input[type="date"],
        .form-group select { /* Add select here */
          width: 100%; /* Ensure input takes full available width */
          box-sizing: border-box; /* Include padding and border in width */
          padding: 8px 10px; /* Reduce padding for input */
        }

        /* Reduce spacing for h2 and h3 in form-container */
        .form-container h2 {
          margin-bottom: 5px; /* Further reduction */
        }

        .form-container h3 {
          margin-top: 8px; /* Further reduction */
          margin-bottom: 3px; /* Reduce spacing below h3 */
        }

        /* Reduce spacing for general form-groups */
        .form-group {
            margin-bottom: 5px; /* Reduce spacing between form groups */
        }

        /* Reduce spacing between label and input/select */
        .form-group label {
          margin-bottom: 3px; /* Reduced from 5px */
        }

        /* Ensure the first form-grid in the form has no extra margin-top */
        .modern-form .form-grid:first-of-type {
            margin-top: 0;
            padding-top: 0;
        }

        /* Adjust spacing between date input and "Increase" title */
        .modern-form .form-grid .form-group:last-of-type { /* Select the last form-group in the first form-grid */
            margin-bottom: 0; /* Remove margin-bottom to reduce spacing */
        }
        .modern-form h4 { /* H4 titles (Increase, Decrease) */
            margin-top: 5px; /* Reduce margin-top */
            margin-bottom: 3px; /* Reduce margin-bottom */
        }

        .modern-form .form-grid { /* Spacing between columns in form-grid */
            gap: 15px; /* Reduce spacing between columns */
        }
        `}
      </style>

      <h2>👁️ Logbook: {farm.tenCoSo}</h2>
      
      {/* Changed to have Farm Name, Address, and Species Name side-by-side */}
      <div className="form-grid"> {/* Use form-grid to create columns */}
        <div className="detail-group">
          <strong>Farm Name:</strong> <p>{farm.tenCoSo}</p>
        </div>
        <div className="detail-group">
          <strong>Address:</strong> <p>{farm.diaChiCoSo}</p> {/* Changed to diaChiCoSo */}
        </div>
        <div className="form-group detail-group"> {/* Moved Species Name dropdown here */}
          <label>Species Name:</label>
          <select
            name="speciesName"
            value={activityFormData.speciesName}
            onChange={handleActivityFormChange}
            required
          >
            <option value="">-- Select species --</option>
            {/* CẬP NHẬT LOGIC HIỂN THỊ TÙY CHỌN CHO DROPDOWN */}
            {farm.loaiDongVatRung && Array.isArray(farm.loaiDongVatRung) && farm.loaiDongVatRung.map((species, index) => (
              <option key={index} value={species.tenLamSan}>
                {species.tenLamSan}
              </option>
            ))}
            {/* Nếu bạn muốn hỗ trợ trường tenLamSan trực tiếp trên đối tượng farm (nếu có) */}
            {typeof farm.tenLamSan === 'string' && farm.tenLamSan && (
                <option key={farm.tenLamSan} value={farm.tenLamSan}>
                    {farm.tenLamSan}
                </option>
            )}
          </select>
        </div>
      </div>

      <h3>Add New Tracking Record:</h3>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleAddActivity} className="modern-form">
        <div className="form-grid"> {/* Use form-grid to arrange form fields */}
          {/* Species Name field has been moved up */}
          <div className="form-group">
            <label>Date Recorded:</label>
            <input
              type="date"
              name="date"
              value={activityFormData.date}
              onChange={handleActivityFormChange}
              required
            />
          </div>
          {/* Moved Reason for Change field here */}
          <div className="form-group">
            <label>Reason for Change:</label>
            <input
              type="text"
              name="reasonForChange"
              value={activityFormData.reasonForChange}
              onChange={handleActivityFormChange}
            />
          </div>
        </div>

        {/* Grouped Increase and Decrease into the same form-grid to be side-by-side */}
        <div className="form-grid">
          <div className="form-section-wrapper"> {/* Wrapper for Increase group */}
            <h4>Increase:</h4>
            <div className="form-grid nested-grid">
              <div className="form-section">
                <h5>Parents:</h5>
                <div className="form-section-row">
                  <div className="form-group">
                    <label>Male:</label>
                    <input type="number" name="increase.parents.male" value={activityFormData.increase.parents.male} onChange={handleActivityFormChange} min="0" />
                  </div>
                  <div className="form-group">
                    <label>Female:</label>
                    <input type="number" name="increase.parents.female" value={activityFormData.increase.parents.female} onChange={handleActivityFormChange} min="0" />
                  </div>
                </div>
              </div>
              <div className="form-section">
                <h5>Other Individuals:</h5>
                <div className="form-section-row">
                  <div className="form-group">
                    <label>Male:</label>
                    <input type="number" name="increase.otherIndividuals.male" value={activityFormData.increase.otherIndividuals.male} onChange={handleActivityFormChange} min="0" />
                  </div>
                  <div className="form-group">
                    <label>Female:</label>
                    <input type="number" name="increase.otherIndividuals.female" value={activityFormData.increase.otherIndividuals.female} onChange={handleActivityFormChange} min="0" />
                  </div>
                  <div className="form-group">
                    <label>Unidentified:</label>
                    <input type="number" name="increase.otherIndividuals.unidentified" value={activityFormData.increase.otherIndividuals.unidentified} onChange={handleActivityFormChange} min="0" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section-wrapper"> {/* Wrapper for Decrease group */}
            <h4>Decrease:</h4>
            <div className="form-grid nested-grid">
              <div className="form-section">
                <h5>Parents:</h5>
                <div className="form-section-row">
                  <div className="form-group">
                    <label>Male:</label>
                    <input type="number" name="decrease.parents.male" value={activityFormData.decrease.parents.male} onChange={handleActivityFormChange} min="0" />
                  </div>
                  <div className="form-group">
                    <label>Female:</label>
                    <input type="number" name="decrease.parents.female" value={activityFormData.decrease.parents.female} onChange={handleActivityFormChange} min="0" />
                  </div>
                </div>
              </div>
              <div className="form-section">
                <h5>Other Individuals:</h5>
                <div className="form-section-row">
                  <div className="form-group">
                    <label>Male:</label>
                    <input type="number" name="decrease.otherIndividuals.male" value={activityFormData.decrease.otherIndividuals.male} onChange={handleActivityFormChange} min="0" />
                  </div>
                  <div className="form-group">
                    <label>Female:</label>
                    <input type="number" name="decrease.otherIndividuals.female" value={activityFormData.decrease.otherIndividuals.female} onChange={handleActivityFormChange} min="0" />
                  </div>
                  <div className="form-group">
                    <label>Unidentified:</label>
                    <input type="number" name="decrease.otherIndividuals.unidentified" value={activityFormData.decrease.otherIndividuals.unidentified} onChange={handleActivityFormChange} min="0" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className="submit-button">Add Record</button>
      </form>

      <h3>Tracking History:</h3>
      <div className="activity-list-container">
        {activities.length === 0 ? (
          <p>No tracking records for this farm yet.</p>
        ) : (
          <table className="activity-table">
            <thead>
              <tr>
                <th rowSpan="3">No.</th>
                <th rowSpan="3">Date</th>
                <th rowSpan="3">Total Individuals</th>
                <th colSpan="5">Current Status</th>
                <th colSpan="10">Changes</th>
                <th rowSpan="3">Reason for Change</th>
                <th rowSpan="3">Verified by Forest Protection Department</th>
                {role === 'admin' && <th rowSpan="3">Delete</th>}
              </tr>
              <tr>
                {/* Current Status */}
                <th colSpan="2">Parents</th>
                <th colSpan="3">Other Individuals</th>
                {/* Changes */}
                <th colSpan="5">Increase</th>
                <th colSpan="5">Decrease</th>
              </tr>
              <tr>
                {/* Current Status -> Parents */}
                <th>Male</th>
                <th>Female</th>
                {/* Current Status -> Other Individuals */}
                <th>Male</th>
                <th>Female</th>
                <th>Unidentified</th>
                {/* Increase -> Parents */}
                <th>Male</th>
                <th>Female</th>
                {/* Increase -> Other Individuals */}
                <th>Male</th>
                <th>Female</th>
                <th>Unidentified</th>
                {/* Decrease -> Parents */}
                <th>Male</th>
                <th>Female</th>
                {/* Decrease -> Other Individuals */}
                <th>Male</th>
                <th>Female</th>
                <th>Unidentified</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity, index) => {
                return (
                  <tr key={activity?._id || `temp-key-${Math.random()}`}>
                    <td>{index + 1}</td>
                    <td>{activity?.date ? new Date(activity.date).toLocaleDateString() : 'N/A'}</td>
                    <td>{activity?.totalIndividuals ?? 0}</td>
                    {/* Current Status */}
                    <td>{activity.currentStatus?.parents?.male ?? 0}</td>
                    <td>{activity.currentStatus?.parents?.female ?? 0}</td>
                    <td>{activity.currentStatus?.otherIndividuals?.male ?? 0}</td>
                    <td>{activity.currentStatus?.otherIndividuals?.female ?? 0}</td>
                    <td>{activity.currentStatus?.otherIndividuals?.unidentified ?? 0}</td>
                    {/* Increase */}
                    <td>{activity.increase?.parents?.male ?? 0}</td>
                    <td>{activity.increase?.parents?.female ?? 0}</td>
                    <td>{activity.increase?.otherIndividuals?.male ?? 0}</td>
                    <td>{activity.increase?.otherIndividuals?.female ?? 0}</td>
                    <td>{activity.increase?.otherIndividuals?.unidentified ?? 0}</td>
                    {/* Decrease */}
                    <td>{activity.decrease?.parents?.male ?? 0}</td>
                    <td>{activity.decrease?.parents?.female ?? 0}</td>
                    <td>{activity.decrease?.otherIndividuals?.male ?? 0}</td>
                    <td>{activity.decrease?.otherIndividuals?.female ?? 0}</td>
                    <td>{activity.decrease?.otherIndividuals?.unidentified ?? 0}</td>
                    <td>{activity?.reasonForChange ?? 'N/A'}</td>
                    <td>{activity?.verifiedBy ?? 'N/A'}</td>
                    {role === 'admin' && (
                      <td>
                        <button onClick={() => handleDeleteActivity(activity._id)} className="delete-button">Delete</button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <div className="detail-actions">
        <button onClick={() => navigate('/admin/farms')} className="cancel-button">Back to List</button>
      </div>
    </div>
  );
}

export default FarmDetail;