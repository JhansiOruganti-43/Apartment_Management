import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/residents': 'Residents',
  '/flats': 'Flats',
  '/billing': 'Billing',
  '/payments': 'Payments',
  '/expenses': 'Expenses',
  '/complaints': 'Complaints',
};

function Navbar({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Dashboard';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary py-3 px-4">
      <div className="d-flex align-items-center flex-grow-1">
        <i className="bi bi-list fs-3 me-3" onClick={toggleSidebar} style={{ cursor: 'pointer' }}></i>
        <h2 className="fs-5 m-0 fw-bold">{title}</h2>
      </div>
      <div className="d-flex align-items-center gap-3">
        {user && (
          <>
            <span className="text-muted small d-none d-md-block">
              <i className={`bi ${user.role === 'admin' ? 'bi-shield-fill text-primary' : 'bi-person-fill'} me-1`}></i>
              {user.username}
            </span>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={logout}
              title="Logout"
            >
              <i className="bi bi-box-arrow-right me-1"></i>
              <span className="d-none d-sm-inline">Logout</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
