// src/components/Sidebar.js
import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, faUser, faUsers, faSignOutAlt, faMapMarkedAlt, faTree, 
  faChartBar, faClipboardList, faWarehouse, faBuilding, faFileAlt, 
  faLayerGroup, faChevronDown, faChevronRight, faDatabase, faUserCog, 
  faSave, faFileUpload, faBell
} from '@fortawesome/free-solid-svg-icons';

// Nhận thêm props sidebarRef
function Sidebar({ userRole, isLoggedIn, isSidebarOpen, toggleSidebar, sidebarRef }) { 
    const role = localStorage.getItem('role');
    const [showRegisterSub, setShowRegisterSub] = useState(false);
    const [showReportSub, setShowReportSub] = useState(false);
    const [showBackupSub, setShowBackupSub] = useState(false);

    const toggleRegisterSub = () => {
        setShowRegisterSub(!showRegisterSub);
    };

    const toggleReportSub = () => {
        setShowReportSub(!showReportSub);
    };

    const toggleBackupSub = () => {
        setShowBackupSub(!showBackupSub);
    };

    return (
        // Gán ref vào div sidebar và thêm class sidebar-open
        <div className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`} ref={sidebarRef}> 
            <nav className="sidebar-nav">
                <ul>
                    {/* ... (các mục menu còn lại) ... */}
                    
                    {/* Mục "Thông báo" */}
                    <li>
                        <NavLink to="/notifications" className={({ isActive }) => isActive ? "active" : ""}>
                            <FontAwesomeIcon icon={faBell} /><span className="menu-text">Thông báo</span>
                        </NavLink>
                    </li>

                    {/* Mục "Đăng ký và quản lý" (có thể mở rộng) */}
                    <li className="sidebar-item">
                        <div className={`summary ${showRegisterSub ? 'open' : ''}`} onClick={toggleRegisterSub}>
                            <FontAwesomeIcon icon={faClipboardList} /><span className="menu-text">Đăng ký và quản lý</span>
                            <FontAwesomeIcon icon={showRegisterSub ? faChevronDown : faChevronRight} className="arrow-icon" />
                        </div>
                        {showRegisterSub && (
                            <ul className="submenu">
                                <li><NavLink to="/khai-bao" className={({ isActive }) => isActive ? "active" : ""}>
                                    <FontAwesomeIcon icon={faFileAlt} /><span className="menu-text">Khai báo cơ sở</span>
                                </NavLink></li>
                                <li><NavLink to="/admin/wood-farms" className={({ isActive }) => isActive ? "active" : ""}>
                                    <FontAwesomeIcon icon={faWarehouse} /><span className="menu-text">Quản lý cơ sở gỗ</span>
                                </NavLink></li>
                                <li><NavLink to="/admin/breeding-farms" className={({ isActive }) => isActive ? "active" : ""}>
                                    <FontAwesomeIcon icon={faBuilding} /><span className="menu-text">Quản lý cơ sở gây nuôi</span>
                                </NavLink></li>
                            </ul>
                        )}
                    </li>

                    {/* Mục "Thống kê và báo cáo" (có thể mở rộng) */}
                    <li className="sidebar-item">
                        <div className={`summary ${showReportSub ? 'open' : ''}`} onClick={toggleReportSub}>
                            <FontAwesomeIcon icon={faChartBar} /><span className="menu-text">Thống kê, báo cáo</span>
                            <FontAwesomeIcon icon={showReportSub ? faChevronDown : faChevronRight} className="arrow-icon" />
                        </div>
                        {showReportSub && (
                            <ul className="submenu">
                                <li><NavLink to="/bao-cao-co-so-go" className={({ isActive }) => isActive ? "active" : ""}>
                                    <FontAwesomeIcon icon={faTree} /><span className="menu-text">Các cơ sở gỗ</span>
                                </NavLink></li>
                                <li><NavLink to="/bao-cao-co-so-gay-nuoi" className={({ isActive }) => isActive ? "active" : ""}>
                                    <FontAwesomeIcon icon={faLayerGroup} /><span className="menu-text">Các cơ sở gây nuôi</span>
                                </NavLink></li>
                                <li><NavLink to="/bao-cao-tong-hop" className={({ isActive }) => isActive ? "active" : ""}>
                                    <FontAwesomeIcon icon={faFileAlt} /><span className="menu-text">Báo cáo Tổng hợp</span>
                                </NavLink></li>
                            </ul>
                        )}
                    </li>

                    {/* Mục Điều hướng bản đồ */}
                    <li>
                        <NavLink to="/google-maps" className={({ isActive }) => isActive ? "active" : ""}>
                            <FontAwesomeIcon icon={faMapMarkedAlt} /><span className="menu-text">Điều hướng bản đồ</span>
                        </NavLink>
                    </li>
                    
                    {role === 'admin' && (
                        <>
                            {/* Mục Quản lý Người dùng */}
                            <li>
                                <NavLink to="/admin/users" className={({ isActive }) => isActive ? "active" : ""}>
                                    <FontAwesomeIcon icon={faUsers} /><span className="menu-text">Quản lý Người dùng</span>
                                </NavLink>
                            </li>
                            {/* Mục "Lưu và tạo dữ liệu" có submenu */}
                            <li className="sidebar-item">
                                <div className={`summary ${showBackupSub ? 'open' : ''}`} onClick={toggleBackupSub}>
                                    <FontAwesomeIcon icon={faDatabase} /><span className="menu-text">Lưu và tạo dữ liệu</span>
                                    <FontAwesomeIcon icon={showBackupSub ? faChevronDown : faChevronRight} className="arrow-icon" />
                                </div>
                                {showBackupSub && (
                                    <ul className="submenu">
                                        <li><NavLink to="/backup/end-year" className={({ isActive }) => isActive ? "active" : ""}>
                                            <FontAwesomeIcon icon={faFileDownload} /><span className="menu-text">Sao lưu cuối năm</span>
                                        </NavLink></li>
                                        <li><NavLink to="/backup/start-year" className={({ isActive }) => isActive ? "active" : ""}>
                                            <FontAwesomeIcon icon={faFileUpload} /><span className="menu-text">Khởi tạo đầu năm</span>
                                        </NavLink></li>
                                    </ul>
                                )}
                            </li>
                            {/* Mục Quản lý Khách hàng */}
                            <li>
                                <NavLink to="/admin/customers" className={({ isActive }) => isActive ? "active" : ""}>
                                    <FontAwesomeIcon icon={faUserCog} /><span className="menu-text">Quản lý Khách hàng</span>
                                </NavLink>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
        </div>
    );
}

export default Sidebar;