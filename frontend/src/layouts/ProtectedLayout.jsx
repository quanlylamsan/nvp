import React, { useRef, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import logoKiemLam from '../assets/images/logo_kiemlam.png';
import bannerImage from '../assets/images/banner.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faSignOutAlt, faEdit, faInfoCircle, faBars
} from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom';
import '../Dashboard.css';


const ProtectedLayout = () => {
  const { auth, setAuthStatus } = useAuth();
  const { isLoggedIn, role, token } = auth;

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showUserProfileMenu, setShowUserProfileMenu] = useState(false);

  const sidebarRef = useRef(null);
  const userMenuRef = useRef(null);
  const hamburgerButtonRef = useRef(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    setAuthStatus({ isLoggedIn: false, user: null, role: null, token: null });
  };

  if (!isLoggedIn || !token) return <Navigate to="/login" replace />;

  return (
    <>
      <Sidebar
        userRole={role}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        sidebarRef={sidebarRef}
      />

      <div className="main-layout-content logged-in">
        <div className="main-header-banner" style={{ '--banner-image-url': `url(${bannerImage})` }}>
          <div className="header-content-wrapper">
            <button className="hamburger-menu-button" onClick={toggleSidebar} ref={hamburgerButtonRef}>
              <FontAwesomeIcon icon={faBars} />
            </button>

            <img src={logoKiemLam} alt="Logo Chi cục Kiểm Lâm" className="header-logo" />
            <div className="header-text">
              <h1>CHI CỤC KIỂM LÂM TỈNH ĐỒNG THÁP</h1>
              <h2>QUẢN LÝ LÂM SẢN</h2>
              <h3 translate="no">Software copyright: Nguyen Văn Phúc &copy;Ver 2025 1.0.0&copy;</h3>
            </div>
          </div>

          <div className={`user-profile-banner ${showUserProfileMenu ? 'open' : ''}`} ref={userMenuRef}>
            <div className="user-info-display" onClick={() => setShowUserProfileMenu(!showUserProfileMenu)}>
              <div className="user-avatar-banner">
                <FontAwesomeIcon icon={faUser} />
              </div>
              <div className="user-info-text-banner">
                <span className="user-name-banner">User</span>
                <span className="user-role-banner">
                  {role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
                </span>
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
              <NavLink to="/login" onClick={handleLogout} className="dropdown-item logout-item">
                <FontAwesomeIcon icon={faSignOutAlt} /> Đăng xuất
              </NavLink>
            </div>
          </div>
        </div>

        <div className="route-content-wrapper">
          <Outlet /> {/* Đây là phần quan trọng */}
        </div>
      </div>
    </>
  );
};

export default ProtectedLayout;
