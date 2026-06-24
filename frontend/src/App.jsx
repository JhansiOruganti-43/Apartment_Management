import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Residents from './pages/Residents';
import Flats from './pages/Flats';
import Billing from './pages/Billing';
import Payments from './pages/Payments';
import Expenses from './pages/Expenses';
import Complaints from './pages/Complaints';

function AppLayout() {
  const { user } = useAuth();
  const [toggled, setToggled] = useState(false);

  if (!user) {
    return <Login />;
  }

  return (
    <div id="wrapper" className={toggled ? 'toggled' : ''}>
      <Sidebar />
      <div id="page-content-wrapper">
        <Navbar toggleSidebar={() => setToggled(!toggled)} />
        <div className="container-fluid px-4 py-4 content-area">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/residents" element={<Residents />} />
            <Route path="/flats" element={<Flats />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
