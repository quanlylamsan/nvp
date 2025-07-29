import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';

// Import các trang
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/Dashboard';
import WoodFarmListPage from './pages/RegisterManageSub1Page';
import BreedingFarmListPage from './pages/RegisterManageSub2Page';
import UnauthorizedPage from './pages/UnauthorizedPage';
import UserListPage from './pages/UserListPage';

function App() {
  // Router và AuthProvider đã được chuyển ra file index.js
  return (
    <Routes>
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

      <Route
        path="/admin/users"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <UserListPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
