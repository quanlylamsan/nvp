import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import UserListPage from './pages/UserListPage';
import CustomerListPage from './pages/CustomerListPage';
import KhaiBaoCoSo from './pages/KhaiBaoCoSoPage';
import LogoutPage from './pages/LogoutPage';
import Sidebar from './components/Sidebar';

function App() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  return (
    <Router>
      <div style={{ display: 'flex' }}>
        {token && <Sidebar />} {/* ✅ Hiển thị sidebar nếu đã đăng nhập */}

        <div style={{ flex: 1, padding: 20 }}>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/" />} />
            <Route path="/khai-bao" element={token ? <KhaiBaoCoSo /> : <Navigate to="/" />} />
            <Route path="/admin/users" element={token && role === 'admin' ? <UserListPage /> : <Navigate to="/" />} />
            <Route path="/admin/customers" element={token && role === 'admin' ? <CustomerListPage /> : <Navigate to="/" />} />
            <Route path="/logout" element={<LogoutPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
