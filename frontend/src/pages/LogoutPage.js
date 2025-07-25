import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Nhận prop setAuthStatus từ App.js
function LogoutPage({ setAuthStatus }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Xóa token và vai trò khỏi localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    
    // Reset trạng thái token và role trong App.js
    if (setAuthStatus) { // Đảm bảo prop tồn tại
      setAuthStatus(null, null); // Set token và role về null
    }

    // Chuyển hướng về trang đăng nhập sau khi đăng xuất
    navigate('/');
  }, [navigate, setAuthStatus]); // Thêm setAuthStatus vào dependency array

  return (
    <div>
      <p>Đang đăng xuất...</p>
    </div>
  );
}

export default LogoutPage;