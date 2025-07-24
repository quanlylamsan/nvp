import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FarmDashboard from './FarmDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/dashboard" element={<FarmDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
