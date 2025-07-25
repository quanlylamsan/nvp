import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import UserListPage from './pages/UserListPage';
import CustomerListPage from './pages/CustomerListPage';
import KhaiBaoCoSoPage from './pages/KhaiBaoCoSoPage';
import LogoutPage from './pages/LogoutPage';
import Sidebar from './components/Sidebar';

function App() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  return (
    <Router basename="/wildlife-frontend">
      <div style={{ display: 'flex' }}>
        {token && <Sidebar />}

        <div style={{ flex: 1, padding: 20 }}>
          <Routes>
            {/* Dòng này thay thế <Route path="/" ... /> */}
            <Route index element={<LoginPage />} /> {/* Sửa ở đây */}

            <Route path="dashboard" element={token ? <Dashboard /> : <Navigate to="/" />} /> {/* Các path còn lại không cần "/" đầu tiên */}
            <Route path="khai-bao" element={token ? <KhaiBaoCoSoPage /> : <Navigate to="/" />} />
            <Route path="admin/users" element={token && role === 'admin' ? <UserListPage /> : <Navigate to="/" />} />
            <Route path="admin/customers" element={token && role === 'admin' ? <CustomerListPage /> : <Navigate to="/" />} />
            <Route path="logout" element={<LogoutPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;