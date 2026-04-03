import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import ProtectedLayout from './layouts/ProtectedLayout';
import LoginPage from './pages/LoginPage';
import Thongbao from './pages/Thongbao';
import UnauthorizedPage from './pages/UnauthorizedPage';
import DashboardPage from './pages/Dashboard';
import KhaiBaoCoSo from './pages/KhaiBaoCoSo';
import KhaiBaoCoSoDongvat from './pages/KhaiBaoCoSoDongvat';
import RegisterManageSub1Page from './pages/RegisterManageSub1Page'; //Quan ly go
import RegisterManageSub2Page from './pages/RegisterManageSub2Page'; //Quan ly dong vat
import Googlemaps from './pages/Googlemaps';
import WoodDetail from './pages/WoodDetail';
import FarmDetail from './pages/FarmDetail';
import FarmEditPage from './pages/FarmEditPage';
import WoodEditPage from './pages/WoodEditPage'; // Đảm bảo import đúng component
import MasterProductListPage from './pages/MasterProductListPage'; //Tong hop go
import MasterAnimalListPage from './pages/MasterAnimalListPage'; //Tong hop dong vat
import UserListPage from './pages/UserListPage';
import CustomerListPage from './pages/CustomerListPage';

function App() {
  return (
    <div>
      <ToastContainer position="top-right" autoClose={4000} />
      <Routes>
        {/* === Public Routes === */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        {/* === Protected Routes === */}
        <Route
          element={
            <PrivateRoute allowedRoles={['admin', 'manager', 'staff']}>
              <ProtectedLayout />
            </PrivateRoute>
          }
        >
          {/* Default route after login */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />
		  <Route path="Thongbao" element={<Thongbao />} />
          <Route path="khai-bao" element={<KhaiBaoCoSo />} />
		  <Route path="khai-bao-dongvat" element={<KhaiBaoCoSoDongvat />} />
          <Route path="google-maps" element={<Googlemaps />} />
          <Route path="tonghop-go" element={<MasterProductListPage />} />
		  <Route path="tonghop-dongvat" element={<MasterAnimalListPage />} />

          {/* Farm (Gây nuôi) specific routes */}
          <Route path="admin/breeding-farms" element={<RegisterManageSub2Page />} />
          <Route path="farm-details/:id" element={<FarmDetail />} />
          <Route path="edit-farm/:id" element={<FarmEditPage />} />
  

          {/* Wood (Kinh doanh gỗ) specific routes */}
          <Route path="admin/wood-farms" element={<RegisterManageSub1Page />} />
          <Route path="admin/woods/:farmId" element={<WoodDetail />} />
          <Route path="edit-wood/:id" element={<WoodEditPage />} />

          
          {/* Admin only routes */}
          <Route path="admin/users" element={<UserListPage />} />
          <Route path="admin/customers" element={<CustomerListPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;






