import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/Dashboard';
import WoodFarmListPage from './pages/RegisterManageSub1Page';
import BreedingFarmListPage from './pages/RegisterManageSub2Page';
import UnauthorizedPage from './pages/UnauthorizedPage';
import PrivateRoute from './components/PrivateRoute';

function AppRoutes() {
  return (
    <Routes>
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
    </Routes>
  );
}

export default AppRoutes;
