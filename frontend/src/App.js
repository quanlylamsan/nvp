import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Import các trang
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/Dashboard';
import WoodFarmListPage from './pages/RegisterManageSub1Page';
import BreedingFarmListPage from './pages/RegisterManageSub2Page';
import UnauthorizedPage from './pages/UnauthorizedPage';
import UserListPage from './pages/UserListPage'; // 👈 Bổ sung import trang quản lý người dùng

function App() {
  return (
    <AuthProvider>
      <Router basename="/nvp">
        <Routes>
          {/* Các route hiện có của bạn */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute allowedRoles={['admin', 'manager', 'staff']}>
                <DashboardPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/wood-farms"
            element={
              <PrivateRoute allowedRoles={['admin', 'manager']}>
                <WoodFarmListPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/breeding-farms"
            element={
              <PrivateRoute allowedRoles={['admin', 'manager', 'staff']}>
                <BreedingFarmListPage />
              </PrivateRoute>
            }
          />

          {/* === ROUTE MỚI CHO TRANG QUẢN LÝ NGƯỜI DÙNG === */}
          <Route
            path="/admin/users"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <UserListPage />
              </PrivateRoute>
            }
          />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
