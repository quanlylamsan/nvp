// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import UserListPage from './pages/UserListPage';
import CustomerListPage from './pages/CustomerListPage';
import KhaiBaoCoSo from './pages/KhaiBaoCoSo';
import LogoutPage from './pages/LogoutPage';
import Sidebar from './components/Sidebar';
import FarmDetail from './pages/FarmDetail';
import WoodFarmListPage from './pages/RegisterManageSub1Page';
import BreedingFarmListPage from './pages/RegisterManageSub2Page';
import FarmEditPage from './pages/FarmEditPage';
import GoogleMapsPage from './pages/Googlemaps';
import WoodDetail from './pages/WoodDetail';
import AddProductToFarm from './pages/AddProductToFarm';
import MasterProductListPage from './pages/MasterProductListPage';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faEdit, faInfoCircle, faBars } from '@fortawesome/free-solid-svg-icons'; // Import faBars (hamburger icon)

import './Dashboard.css';
import bannerImage from './assets/images/banner.jpg';
import logoKiemLam from './assets/images/logo_kiemlam.png';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [showUserProfileMenu, setShowUserProfileMenu] = useState(false); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State mới cho sidebar mobile

  const userMenuRef = useRef(null); 
  const sidebarRef = useRef(null); // Ref mới cho sidebar

  const handleSetAuthStatus = (newToken, newRole) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', newRole);
    setToken(newToken);
    setRole(newRole);
  };

  const handleLogout = () => {
    handleSetAuthStatus('', ''); 
    setShowUserProfileMenu(false); 
  };

  const toggleSidebar = () => { // Hàm để mở/đóng sidebar mobile
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Logic để đóng menu user khi click ra ngoài
  useEffect(() => {
    function handleClickOutsideUserMenu(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutsideUserMenu);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideUserMenu);
    };
  }, [userMenuRef]);

  // Logic để đóng sidebar khi click ra ngoài (mobile)
  useEffect(() => {
    function handleClickOutsideSidebar(event) {
      // Chỉ chạy logic này trên mobile khi sidebar đang mở và click không phải vào sidebar hay hamburger
      if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target) && !event.target.closest('.hamburger-menu-button')) {
        setIsSidebarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutsideSidebar);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideSidebar);
    };
  }, [isSidebarOpen, sidebarRef]);


  useEffect(() => {
    setToken(localStorage.getItem('token'));
    setRole(localStorage.getItem('role'));
  }, []);

  const isLoggedIn = !!token;

  console.log('App.js - Is Logged In:', isLoggedIn, 'Role:', role);
  console.log('showUserProfileMenu current state:', showUserProfileMenu);
  console.log('isSidebarOpen state:', isSidebarOpen); // Log trạng thái sidebar

  return (
    <Router basename="/nvp">
      <div className="app-container">
        {/* Truyền prop isSidebarOpen và toggleSidebar cho Sidebar */}
        {isLoggedIn && <Sidebar userRole={role} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />} 

        <div className={`main-layout-content ${isLoggedIn ? 'logged-in' : ''} ${isSidebarOpen ? 'sidebar-open' : ''}`}> {/* Thêm class sidebar-open */}
          <div className="main-header-banner" style={{ '--banner-image-url': `url(${bannerImage})` }}>
            <div className="header-content-wrapper">
              {/* Nút Hamburger cho Mobile */}
              {isLoggedIn && (
                <button className="hamburger-menu-button" onClick={toggleSidebar}>
                  <FontAwesomeIcon icon={faBars} />
                </button>
              )}
              
              <img src={logoKiemLam} alt="Logo Chi cục Kiểm Lâm" className="header-logo" />
              <div className="header-text">
                <h1>CHI CỤC KIỂM LÂM TỈNH ĐỒNG THÁP</h1>
                <h2>QUẢN LÝ LÂM SẢN</h2>
                <h3 className="header-copyright" translate="no">Software copyright: Nguyen Văn Phúc &copy;Ver 2025 1.0.0&copy;</h3>
              </div>
            </div>
            
            {/* THÊM PHẦN USER VÀ NÚT ĐĂNG XUẤT VÀO ĐÂY */}
            {isLoggedIn && ( /* Chỉ hiển thị khi đã đăng nhập */
                <div 
                    className={`user-profile-banner ${showUserProfileMenu ? 'open' : ''}`} 
                    ref={userMenuRef}
                >
                    <div className="user-info-display" onClick={() => setShowUserProfileMenu(!showUserProfileMenu)}>
                        <div className="user-avatar-banner">
                            <FontAwesomeIcon icon={faUser} />
                        </div>
                        <div className="user-info-text-banner">
                            <span className="user-name-banner">User</span>
                            <span className="user-role-banner">{role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}</span>
                        </div>
                    </div>

                    <div className="user-dropdown-menu">
                        <NavLink to="/user-profile" className="dropdown-item" onClick={() => setShowUserProfileMenu(false)}>
                            <FontAwesomeIcon icon={faInfoCircle} /> Thông tin cá nhân
                        </NavLink>
                        <NavLink to="/edit-profile" className="dropdown-item" onClick={() => setShowUserProfileMenu(false)}>
                            <FontAwesomeIcon icon={faEdit} /> Chỉnh sửa hồ sơ
                        </NavLink>
                        <div className="dropdown-divider"></div>
                        <NavLink to="/logout" onClick={handleLogout} className="dropdown-item logout-item">
                            <FontAwesomeIcon icon={faSignOutAlt} /> Đăng xuất
                        </NavLink>
                    </div>
                </div>
            )}
            
          </div>

          <div className="route-content-wrapper">
            <Routes>
              <Route path="/" element={<LoginPage setAuthStatus={handleSetAuthStatus} />} />
              <Route path="/admin/woods/:farmId" element={<WoodDetail />} />
              <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />} />
              <Route path="/khai-bao" element={isLoggedIn ? <KhaiBaoCoSo /> : <Navigate to="/" />} />
              <Route path="/bao-cao-tong-hop" element={<MasterProductListPage />} />
              <Route path="/farm/:farmId/add-product" element={<AddProductToFarm />} />
              <Route
                path="/admin/wood-farms"
                element={isLoggedIn && role === 'admin' ? <WoodFarmListPage /> : <Navigate to="/" />}
              />
              <Route path="/google-maps" element={isLoggedIn ? <GoogleMapsPage /> : <Navigate to="/" />} />
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