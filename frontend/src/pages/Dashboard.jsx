import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ icon, label, value, color, link }) => (
  <div className="col-12 col-sm-6 col-xl-3 mb-4">
    <Link to={link || '#'} className="text-decoration-none">
      <div className="glass-card p-4 h-100 stat-card-hover">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <p className="text-muted mb-1 text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '1.5px' }}>{label}</p>
            <h2 className="mb-0 fw-bold">{value}</h2>
          </div>
          <div className={`stat-icon-box ${color}`}>
            <i className={`bi ${icon}`}></i>
          </div>
        </div>
      </div>
    </Link>
  </div>
);

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_flats: 0, occupied_flats: 0, vacant_flats: 0,
    total_residents: 0, pending_bills: 0, total_expenses: 0,
    total_revenue: 0, total_complaints: 0, pending_complaints: 0, resolved_complaints: 0
  });
  const [recentBills, setRecentBills] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [statsRes, billsRes, complaintsRes] = await Promise.all([
        axios.get('http://127.0.0.1:5000/api/stats'),
        axios.get('http://127.0.0.1:5000/api/bills'),
        axios.get('http://127.0.0.1:5000/api/complaints'),
      ]);
      setStats(statsRes.data);
      setRecentBills(billsRes.data.slice(0, 5));
      setRecentComplaints(complaintsRes.data.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Welcome */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Welcome back, {user?.username} 👋</h4>
        <p className="text-muted mb-0">Here's your apartment overview for today</p>
      </div>

      {/* Stats Row 1 */}
      <div className="row">
        <StatCard icon="bi-buildings" label="Total Flats" value={stats.total_flats} color="icon-blue" link="/flats" />
        <StatCard icon="bi-door-closed-fill" label="Occupied Flats" value={stats.occupied_flats} color="icon-green" link="/flats" />
        <StatCard icon="bi-door-open-fill" label="Vacant Flats" value={stats.vacant_flats} color="icon-orange" link="/flats" />
        <StatCard icon="bi-people-fill" label="Total Residents" value={stats.total_residents} color="icon-purple" link="/residents" />
      </div>

      {/* Stats Row 2 */}
      <div className="row">
        <StatCard icon="bi-receipt" label="Pending Bills" value={stats.pending_bills} color="icon-yellow" link="/billing" />
        <StatCard icon="bi-graph-down-arrow" label="Total Expenses" value={`₹${stats.total_expenses.toLocaleString('en-IN')}`} color="icon-red" link="/expenses" />
        <StatCard icon="bi-cash-stack" label="Revenue Collected" value={`₹${stats.total_revenue.toLocaleString('en-IN')}`} color="icon-teal" link="/payments" />
        <StatCard icon="bi-chat-left-dots-fill" label="Total Complaints" value={stats.total_complaints} color="icon-indigo" link="/complaints" />
      </div>

      {/* Bottom Cards */}
      <div className="row">
        {/* Recent Bills */}
        <div className="col-12 col-lg-6 mb-4">
          <div className="glass-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0"><i className="bi bi-receipt me-2 text-primary"></i>Recent Bills</h6>
              <Link to="/billing" className="text-primary small">View All</Link>
            </div>
            {recentBills.length === 0 ? (
              <div className="text-center text-muted py-4">
                <i className="bi bi-inbox fs-3 d-block mb-2"></i>No bills yet
              </div>
            ) : (
              recentBills.map(b => (
                <div key={b.id} className="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary">
                  <div>
                    <span className="fw-bold small">Flat {b.flat_id}</span>
                    <span className="text-muted small ms-2">{b.month} {b.year}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-primary small">₹{b.total_amount.toLocaleString('en-IN')}</span>
                    <span className={`badge ${b.status === 'Paid' ? 'bg-success' : 'bg-warning text-dark'}`} style={{ fontSize: '0.65rem' }}>
                      {b.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Complaints + Quick Actions */}
        <div className="col-12 col-lg-6 mb-4">
          <div className="glass-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0"><i className="bi bi-chat-left-dots me-2 text-warning"></i>Recent Complaints</h6>
              <Link to="/complaints" className="text-primary small">View All</Link>
            </div>
            {recentComplaints.length === 0 ? (
              <div className="text-center text-muted py-4">
                <i className="bi bi-emoji-smile fs-3 d-block mb-2"></i>No complaints — all good!
              </div>
            ) : (
              recentComplaints.map(c => (
                <div key={c.id} className="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary">
                  <div>
                    <span className="fw-bold small">{c.title}</span>
                    <span className="text-muted small ms-2">Flat {c.flat_id}</span>
                  </div>
                  <span className={`badge ${
                    c.status === 'Resolved' ? 'bg-success' :
                    c.status === 'In Progress' ? 'bg-info text-dark' : 'bg-warning text-dark'
                  }`} style={{ fontSize: '0.65rem' }}>
                    {c.status}
                  </span>
                </div>
              ))
            )}
            {/* Complaint Summary */}
            <div className="d-flex gap-3 mt-3 pt-2 border-top border-secondary">
              <div className="text-center flex-fill">
                <div className="fw-bold text-warning">{stats.pending_complaints}</div>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>Pending</div>
              </div>
              <div className="text-center flex-fill">
                <div className="fw-bold text-info">{stats.total_complaints - stats.pending_complaints - stats.resolved_complaints}</div>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>In Progress</div>
              </div>
              <div className="text-center flex-fill">
                <div className="fw-bold text-success">{stats.resolved_complaints}</div>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>Resolved</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Admin only */}
      {user?.role === 'admin' && (
        <div className="glass-card p-4">
          <h6 className="fw-bold mb-3"><i className="bi bi-lightning-charge me-2 text-warning"></i>Quick Actions</h6>
          <div className="row g-2">
            <div className="col-6 col-md-3">
              <Link to="/residents" className="btn btn-primary-gradient w-100 py-2 text-start small">
                <i className="bi bi-person-plus me-2"></i>Add Resident
              </Link>
            </div>
            <div className="col-6 col-md-3">
              <Link to="/flats" className="btn btn-primary-gradient w-100 py-2 text-start small">
                <i className="bi bi-house-add me-2"></i>Add Flat
              </Link>
            </div>
            <div className="col-6 col-md-3">
              <Link to="/billing" className="btn btn-primary-gradient w-100 py-2 text-start small">
                <i className="bi bi-receipt me-2"></i>Generate Bill
              </Link>
            </div>
            <div className="col-6 col-md-3">
              <Link to="/expenses" className="btn btn-primary-gradient w-100 py-2 text-start small">
                <i className="bi bi-plus-circle me-2"></i>Add Expense
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
