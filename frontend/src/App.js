import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import ProtectedLayout from './layouts/ProtectedLayout';
import LoginPage from './pages/LoginPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import DashboardPage from './pages/Dashboard';
import KhaiBaoCoSo from './pages/KhaiBaoCoSo';
import RegisterManageSub1Page from './pages/RegisterManageSub1Page';
import RegisterManageSub2Page from './pages/RegisterManageSub2Page';
import Googlemaps from './pages/Googlemaps';
import WoodDetail from './pages/WoodDetail';
import FarmDetail from './pages/FarmDetail';
import FarmEditPage from './pages/FarmEditPage';
import WoodEditPage from './pages/WoodEditPage';
import AddProductToFarm from './pages/AddProductToFarm';
import MasterProductListPage from './pages/MasterProductListPage';
import UserListPage from './pages/UserListPage';
import CustomerListPage from './pages/CustomerListPage';


function App() {
  return (
    <Routes>
      {/* Khi người dùng truy cập /nvp thì điều hướng sang /nvp/login */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route
        element={
          <PrivateRoute allowedRoles={['admin', 'manager', 'staff']}>
            <ProtectedLayout />
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="khai-bao" element={<KhaiBaoCoSo />} />
        <Route path="admin/wood-farms" element={<RegisterManageSub1Page />} />
        <Route path="admin/breeding-farms" element={<RegisterManageSub2Page />} />
        <Route path="google-maps" element={<Googlemaps />} />
        
        {/* === SỬA LỖI Ở ĐÂY === */}
        {/* Thay đổi "wood-detail/:id" thành "/admin/woods/:id" để khớp với lệnh navigate */}
        <Route path="/admin/woods/:id" element={<WoodDetail />} />
        
        <Route path="farm-details/:id" element={<FarmDetail />} />
        <Route path="edit-wood/:id" element={<FarmEditPage />} />
		 <Route path="edit-farm/:id" element={<FarmEditPage />} />
        <Route path="farm/:farmId/add-product" element={<AddProductToFarm />} />
        <Route path="bao-cao-tong-hop" element={<MasterProductListPage />} />
        <Route path="admin/users" element={<UserListPage />} />
        <Route path="admin/customers" element={<CustomerListPage />} />
        
      </Route>
    </Routes>
  );
}

export default App;
