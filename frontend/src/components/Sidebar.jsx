import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar() {
  const { user } = useAuth();

  const navItems = [
    { to: '/', icon: 'bi-speedometer2', label: 'Dashboard' },
    { to: '/residents', icon: 'bi-people', label: 'Residents' },
    { to: '/flats', icon: 'bi-door-open', label: 'Flats' },
    { to: '/billing', icon: 'bi-receipt', label: 'Billing' },
    { to: '/payments', icon: 'bi-wallet2', label: 'Payments' },
    { to: '/expenses', icon: 'bi-graph-down-arrow', label: 'Expenses' },
    { to: '/complaints', icon: 'bi-chat-left-dots', label: 'Complaints' },
  ];

  return (
    <div className="sidebar text-white d-flex flex-column">
      <div className="sidebar-heading fs-5 fw-bold text-center py-4 border-bottom border-secondary">
        <i className="bi bi-buildings me-2"></i>Apt Manager
      </div>

      {/* User badge */}
      {user && (
        <div className="text-center py-3 border-bottom border-secondary">
          <div className="sidebar-user-avatar mx-auto mb-2">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <p className="mb-0 small fw-bold">{user.username}</p>
          <span className={`badge mt-1 ${user.role === 'admin' ? 'bg-primary' : 'bg-secondary'}`} style={{ fontSize: '0.65rem' }}>
            <i className={`bi ${user.role === 'admin' ? 'bi-shield-fill' : 'bi-person-fill'} me-1`}></i>
            {user.role}
          </span>
        </div>
      )}

      <div className="list-group list-group-flush my-2 flex-grow-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `list-group-item fw-semibold ${isActive ? 'active' : ''}`}
          >
            <i className={`bi ${item.icon} me-2`}></i>{item.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
