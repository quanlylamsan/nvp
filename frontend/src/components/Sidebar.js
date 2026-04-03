// src/components/Sidebar.js
import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faMapMarkedAlt,
  faTree,
  faChartBar,
  faClipboardList,
  faWarehouse,
  faBuilding,
  faFileAlt,
  faLayerGroup,
  faChevronDown,
  faChevronRight,
  faDatabase,
  faUserCog,
  faFileUpload,
  faFileDownload,
  faBell
} from "@fortawesome/free-solid-svg-icons";

function Sidebar({ isSidebarOpen, sidebarRef }) {
  const role = localStorage.getItem("role");
  const location = useLocation();

  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menuName) => {
    setOpenMenu((prev) => (prev === menuName ? null : menuName));
  };

  // Tự động mở submenu theo route
  useEffect(() => {
    const path = location.pathname;

    if (path.startsWith("/khai-bao")) setOpenMenu("register");
    else if (path.startsWith("/admin/wood-farms") || path.startsWith("/admin/breeding-farms")) setOpenMenu("manage");
    else if (path.startsWith("/bao-cao")) setOpenMenu("report");
    else if (path.startsWith("/backup")) setOpenMenu("backup");
  }, [location.pathname]);

  return (
    <div className={`sidebar ${isSidebarOpen ? "sidebar-open" : ""}`} ref={sidebarRef}>
      <nav className="sidebar-nav">
        <ul>

          {/* Thông báo */}
          <li>
            <NavLink to="/Thongbao" className={({ isActive }) => (isActive ? "active" : "")}>
              <FontAwesomeIcon icon={faBell} />
              <span className="menu-text">Thông báo</span>
            </NavLink>
          </li>

          {/* Đăng ký */}
          <li className="sidebar-item">
            <div
              className={`summary ${openMenu === "register" ? "open" : ""}`}
              onClick={() => toggleMenu("register")}
            >
              <FontAwesomeIcon icon={faClipboardList} />
              <span className="menu-text">Đăng ký</span>
              <FontAwesomeIcon
                icon={openMenu === "register" ? faChevronDown : faChevronRight}
                className="arrow-icon"
              />
            </div>

            <ul className={`submenu ${openMenu === "register" ? "show" : ""}`}>
              <li>
                <NavLink to="/khai-bao" className={({ isActive }) => (isActive ? "active" : "")}>
                  <FontAwesomeIcon icon={faFileAlt} />
                  <span className="menu-text">Thực vật rừng</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/khai-bao-dongvat" className={({ isActive }) => (isActive ? "active" : "")}>
                  <FontAwesomeIcon icon={faWarehouse} />
                  <span className="menu-text">Động vật rừng</span>
                </NavLink>
              </li>
            </ul>
          </li>

          {/* Quản lý */}
          <li className="sidebar-item">
            <div
              className={`summary ${openMenu === "manage" ? "open" : ""}`}
              onClick={() => toggleMenu("manage")}
            >
              <FontAwesomeIcon icon={faClipboardList} />
              <span className="menu-text">Quản lý</span>
              <FontAwesomeIcon
                icon={openMenu === "manage" ? faChevronDown : faChevronRight}
                className="arrow-icon"
              />
            </div>

            <ul className={`submenu ${openMenu === "manage" ? "show" : ""}`}>
              <li>
                <NavLink to="/admin/wood-farms" className={({ isActive }) => (isActive ? "active" : "")}>
                  <FontAwesomeIcon icon={faWarehouse} />
                  <span className="menu-text">Thực vật rừng</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/breeding-farms" className={({ isActive }) => (isActive ? "active" : "")}>
                  <FontAwesomeIcon icon={faBuilding} />
                  <span className="menu-text">Động vật rừng</span>
                </NavLink>
              </li>
            </ul>
          </li>

          {/* Thống kê - Báo cáo */}
          <li className="sidebar-item">
            <div
              className={`summary ${openMenu === "report" ? "open" : ""}`}
              onClick={() => toggleMenu("report")}
            >
              <FontAwesomeIcon icon={faChartBar} />
              <span className="menu-text">Thống kê, báo cáo</span>
              <FontAwesomeIcon
                icon={openMenu === "report" ? faChevronDown : faChevronRight}
                className="arrow-icon"
              />
            </div>

            <ul className={`submenu ${openMenu === "report" ? "show" : ""}`}>
              <li>
                <NavLink to="/bao-cao-co-so-go" className={({ isActive }) => (isActive ? "active" : "")}>
                  <FontAwesomeIcon icon={faTree} />
                  <span className="menu-text">Các cơ sở gỗ</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/bao-cao-co-so-gay-nuoi" className={({ isActive }) => (isActive ? "active" : "")}>
                  <FontAwesomeIcon icon={faLayerGroup} />
                  <span className="menu-text">Các cơ sở gây nuôi</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/tonghop-go" className={({ isActive }) => (isActive ? "active" : "")}>
                  <FontAwesomeIcon icon={faFileAlt} />
                  <span className="menu-text">Tổng hợp về gỗ</span>
                </NavLink>
              </li>
			  
			  <li>
                <NavLink to="/tonghop-dongvat" className={({ isActive }) => (isActive ? "active" : "")}>
                  <FontAwesomeIcon icon={faFileAlt} />
                  <span className="menu-text">Tổng hợp về động vật</span>
                </NavLink>
				</li>
            </ul>
          </li>

          {/* Google Maps */}
          <li>
            <NavLink to="/google-maps" className={({ isActive }) => (isActive ? "active" : "")}>
              <FontAwesomeIcon icon={faMapMarkedAlt} />
              <span className="menu-text">Điều hướng bản đồ</span>
            </NavLink>
          </li>

          {/* Admin */}
          {role === "admin" && (
            <>
              <li>
                <NavLink to="/admin/users" className={({ isActive }) => (isActive ? "active" : "")}>
                  <FontAwesomeIcon icon={faUsers} />
                  <span className="menu-text">Quản lý Người dùng</span>
                </NavLink>
              </li>

              <li>
                <NavLink to="/admin/customers" className={({ isActive }) => (isActive ? "active" : "")}>
                  <FontAwesomeIcon icon={faUserCog} />
                  <span className="menu-text">Quản lý Khách hàng</span>
                </NavLink>
              </li>

              <li className="sidebar-item">
                <div
                  className={`summary ${openMenu === "backup" ? "open" : ""}`}
                  onClick={() => toggleMenu("backup")}
                >
                  <FontAwesomeIcon icon={faDatabase} />
                  <span className="menu-text">Lưu và tạo dữ liệu</span>
                  <FontAwesomeIcon
                    icon={openMenu === "backup" ? faChevronDown : faChevronRight}
                    className="arrow-icon"
                  />
                </div>

                <ul className={`submenu ${openMenu === "backup" ? "show" : ""}`}>
                  <li>
                    <NavLink to="/backup/end-year" className={({ isActive }) => (isActive ? "active" : "")}>
                      <FontAwesomeIcon icon={faFileDownload} />
                      <span className="menu-text">Sao lưu cuối năm</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/backup/start-year" className={({ isActive }) => (isActive ? "active" : "")}>
                      <FontAwesomeIcon icon={faFileUpload} />
                      <span className="menu-text">Khởi tạo đầu năm</span>
                    </NavLink>
                  </li>
                </ul>
              </li>
            </>
          )}

        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;