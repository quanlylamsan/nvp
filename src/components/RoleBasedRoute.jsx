import RoleBasedRoute from './RoleBasedRoute';

<Route path="/admin/users" element={
  <RoleBasedRoute allowedRoles={['admin']}>
    <UserListPage />
  </RoleBasedRoute>
} />
