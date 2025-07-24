import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaUserPlus, FaChartBar, FaSignOutAlt, FaBuilding, FaUser, FaUsers, FaClipboardList } from 'react-icons/fa'; // Import thêm icons nếu cần

function Sidebar({ userRole }) { // Nhận userRole làm prop
  return (
    <div className="sidebar">
      <h3>QUẢN LÝ LÂM SẢN</h3> {/* Tiêu đề sidebar */}
      <ul>
        <li>
          <NavLink to="/dashboard" activeClassName="active">
            <FaHome /> Trang chủ
          </NavLink>
        </li>

        {/* Menu cho Đăng ký và quản lý */}
        {(userRole === 'admin' || userRole === 'staff' || userRole === 'customer') && ( // Khách hàng cũng có thể khai báo
          <details>
            <summary>
              <FaClipboardList /> Đăng ký và quản lý
            </summary>
            <ul>
              <li>
                <NavLink to="/khai-bao" activeClassName="active">
                  Khai báo cơ sở nuôi
                </NavLink>
              </li>
              {(userRole === 'admin' || userRole === 'staff') && ( // Chỉ admin và nhân viên quản lý cơ sở
                <li>
                  <NavLink to="/admin/farms" activeClassName="active">
                    Quản lý cơ sở
                  </NavLink>
                </li>
              )}
            </ul>
          </details>
        )}

        {/* Menu cho Thống kê và báo cáo */}
        {(userRole === 'admin' || userRole === 'staff' || userRole === 'customer') && ( // Tất cả đều có thể xem báo cáo
          <details>
            <summary>
              <FaChartBar /> Thống kê và báo cáo
            </summary>
            <ul>
              <li>
                <NavLink to="/thong-ke" activeClassName="active"> {/* Giả định route /thong-ke */}
                  Thống kê
                </NavLink>
              </li>
              <li>
                <NavLink to="/bao-cao" activeClassName="active"> {/* Giả định route /bao-cao */}
                  Báo cáo
                </NavLink>
              </li>
            </ul>
          </details>
        )}

        {/* Menu Quản lý người dùng (chỉ cho Admin) */}
        {userRole === 'admin' && (
          <li>
            <NavLink to="/admin/users" activeClassName="active">
              <FaUser /> Quản lý người dùng
            </NavLink>
          </li>
        )}

        {/* Menu Quản lý khách hàng (chỉ cho Admin) */}
        {userRole === 'admin' && (
          <li>
            <NavLink to="/admin/customers" activeClassName="active">
              <FaUsers /> Quản lý khách hàng
            </NavLink>
          </li>
        )}

        <li>
          <NavLink to="/logout" activeClassName="active">
            <FaSignOutAlt /> Đăng xuất
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;