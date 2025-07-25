// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import UserListPage from './pages/UserListPage';
import CustomerListPage from './pages/CustomerListPage';
import KhaiBaoCoSo from './pages/KhaiBaoCoSo';
import LogoutPage from './pages/LogoutPage';
import Sidebar from './components/Sidebar';
import FarmDetail from './pages/FarmDetail';
// Đổi tên import để tránh xung đột và rõ ràng hơn
import WoodFarmListPage from './pages/RegisterManageSub1Page'; // Đã đổi tên từ FarmListPage
import BreedingFarmListPage from './pages/RegisterManageSub2Page'; // Đã đổi tên từ FarmListPage
import FarmEditPage from './pages/FarmEditPage';
import GoogleMapsPage from './pages/Googlemaps'; // Import trang Google Maps
import WoodDetail from './pages/WoodDetail';
import AddProductToFarm from './pages/AddProductToFarm'; 
import MasterProductListPage from './pages/MasterProductListPage'; // <-- IMPORT COMPONENT MỚI

import './Dashboard.css'; // CSS chung cho dashboard layout

// Import ảnh banner cho background
import bannerImage from './assets/images/banner.jpg'; 

// Import ảnh logo kiểm lâm
import logoKiemLam from './assets/images/logo_kiemlam.png';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  const handleSetAuthStatus = (newToken, newRole) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', newRole);
    setToken(newToken);
    setRole(newRole);
  };

  useEffect(() => {
    setToken(localStorage.getItem('token'));
    setRole(localStorage.getItem('role'));
  }, []);

  const isLoggedIn = !!token; // Convert token to boolean

  console.log('App.js - Is Logged In:', isLoggedIn, 'Role:', role);

  return (
    <Router>
      <div className="dashboard-container">
         {isLoggedIn && <Sidebar userRole={role} />}

        {/* Conditionally apply 'logged-in' class to main-layout-content */}
        <div className={`quanlylamsan ${isLoggedIn ? 'logged-in' : ''}`} style={{ '--banner-image-url': `url(${bannerImage})` }}>
          <div className="main-header-banner">
            {/* Thêm một div bọc để căn giữa logo và text khi chưa đăng nhập */}
            <div className="header-content-wrapper">
              <img src={logoKiemLam} alt="Logo Chi cục Kiểm Lâm" className="header-logo" />
              <div className="header-text">
                <h1>CHI CỤC KIỂM LÂM TỈNH ĐỒNG THÁP</h1>
                <h2>QUẢN LÝ LÂM SẢN</h2>
                <h3 className="header-copyright" translate="no">Software copyright: Nguyen Van Phuc &copy;Ver 2025 1.0.0&copy;</h3>
              </div>
            </div>
          </div>


          <div className="route-content-wrapper">
            <Routes>
              <Route path="/" element={<LoginPage setAuthStatus={handleSetAuthStatus} />} />
			  <Route path="/admin/woods/:farmId" element={<WoodDetail />} /> {/* Đây là WoodDetail.js mới */}
              <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />} />
              <Route path="/khai-bao" element={isLoggedIn ? <KhaiBaoCoSo /> : <Navigate to="/" />} />
			  <Route path="/bao-cao-tong-hop" element={<MasterProductListPage />} />
              <Route path="/farm/:farmId/add-product" element={<AddProductToFarm />} />
              {/* Route cho Quản lý cơ sở kinh doanh, chế biến gỗ */}
              <Route 
                path="/admin/wood-farms" 
                element={isLoggedIn && role === 'admin' ? <WoodFarmListPage /> : <Navigate to="/" />} 
              />
              {/* Route MỚI cho Google Maps */}
              <Route path="/google-maps" element={isLoggedIn ? <GoogleMapsPage /> : <Navigate to="/" />} />
              {/* Route cho Quản lý cơ sở gây nuôi */}
              <Route 
                path="/admin/breeding-farms" 
                element={isLoggedIn && role === 'admin' ? <BreedingFarmListPage /> : <Navigate to="/" />} 
              />

              <Route path="/farm-details/:farmId" element={isLoggedIn ? <FarmDetail /> : <Navigate to="/" />} />
              <Route path="/edit-farm/:farmId" element={isLoggedIn ? <FarmEditPage /> : <Navigate to="/" />} />

              <Route path="/admin/users" element={isLoggedIn && role === 'admin' ? <UserListPage /> : <Navigate to="/" />} />
              <Route path="/admin/customers" element={isLoggedIn && role === 'admin' ? <CustomerListPage /> : <Navigate to="/" />} />
              <Route path="/logout" element={<LogoutPage setAuthStatus={handleSetAuthStatus} />} />
            </Routes>
          </div>
         
        </div>
      </div>
    </Router>
  );
}

export default App;
