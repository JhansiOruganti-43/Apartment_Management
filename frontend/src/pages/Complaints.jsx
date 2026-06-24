import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Water Issue', 'Electricity Issue', 'Lift Issue', 'Security Issue', 'Cleaning Issue', 'Parking Issue', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const STATUS_COLORS = {
  'Pending': 'bg-warning text-dark',
  'In Progress': 'bg-info text-dark',
  'Resolved': 'bg-success'
};

const CATEGORY_ICONS = {
  'Water Issue': 'bi-droplet-fill',
  'Electricity Issue': 'bi-lightning-fill',
  'Lift Issue': 'bi-arrow-up-square',
  'Security Issue': 'bi-shield-exclamation',
  'Cleaning Issue': 'bi-stars',
  'Parking Issue': 'bi-car-front',
  'Other': 'bi-chat-dots'
};

function Complaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [formData, setFormData] = useState({
    resident_name: '', flat_id: '', title: '', description: '',
    category: 'Water Issue', priority: 'Medium'
  });
  const [showModal, setShowModal] = useState(false);
  const [updateModal, setUpdateModal] = useState(null); // complaint being updated
  const [updateData, setUpdateData] = useState({ status: '', remarks: '' });
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/complaints');
      setComplaints(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:5000/api/complaints', formData);
      setShowModal(false);
      setFormData({ resident_name: '', flat_id: '', title: '', description: '', category: 'Water Issue', priority: 'Medium' });
      fetchComplaints();
    } catch (err) { alert("Error raising complaint"); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://127.0.0.1:5000/api/complaints/${updateModal.id}`, updateData);
      setUpdateModal(null);
      fetchComplaints();
    } catch (err) { alert("Error updating complaint"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this complaint?")) return;
    try {
      await axios.delete(`http://127.0.0.1:5000/api/complaints/${id}`);
      fetchComplaints();
    } catch (err) { alert("Error deleting complaint"); }
  };

  const openUpdate = (complaint) => {
    setUpdateModal(complaint);
    setUpdateData({ status: complaint.status, remarks: complaint.remarks || '' });
  };

  const filtered = filterStatus === 'All' ? complaints : complaints.filter(c => c.status === filterStatus);

  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'Pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <p className="text-muted mb-0">Resident complaints & issue tracker</p>
        <button className="btn btn-primary-gradient" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-lg me-1"></i> Raise Complaint
        </button>
      </div>

      {/* Stats */}
      <div className="row mb-4">
        {[
          { label: 'Total', value: totalCount, color: '#6366f1', icon: 'bi-chat-left-dots-fill', filter: 'All' },
          { label: 'Pending', value: pendingCount, color: '#f59e0b', icon: 'bi-hourglass-split', filter: 'Pending' },
          { label: 'In Progress', value: inProgressCount, color: '#06b6d4', icon: 'bi-arrow-clockwise', filter: 'In Progress' },
          { label: 'Resolved', value: resolvedCount, color: '#22c55e', icon: 'bi-check-circle-fill', filter: 'Resolved' },
        ].map(s => (
          <div key={s.label} className="col-6 col-md-3 mb-3">
            <div
              className={`glass-card p-3 text-center cursor-pointer ${filterStatus === s.filter ? 'border border-primary' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setFilterStatus(s.filter)}
            >
              <i className={`bi ${s.icon} fs-2 mb-1 d-block`} style={{ color: s.color }}></i>
              <h4 className="fw-bold mb-0">{s.value}</h4>
              <p className="text-muted mb-0 small">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="d-flex gap-2 mb-3">
        {['All', 'Pending', 'In Progress', 'Resolved'].map(s => (
          <button
            key={s}
            className={`btn btn-sm ${filterStatus === s ? 'btn-primary-gradient' : 'btn-outline-secondary'}`}
            onClick={() => setFilterStatus(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Complaints List */}
      <div className="glass-card p-4">
        {filtered.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-emoji-smile fs-1 d-block mb-3"></i>
            <p>No complaints found {filterStatus !== 'All' ? `with status "${filterStatus}"` : ''}!</p>
          </div>
        ) : (
          filtered.map(c => (
            <div key={c.id} className="complaint-card glass-card p-3 mb-3">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                    <i className={`bi ${CATEGORY_ICONS[c.category] || 'bi-chat-dots'} text-primary`}></i>
                    <span className="fw-bold">{c.title}</span>
                    <span className={`badge ${STATUS_COLORS[c.status] || 'bg-secondary'}`} style={{ fontSize: '0.65rem' }}>
                      {c.status}
                    </span>
                    <span className={`badge ${c.priority === 'Urgent' ? 'bg-danger' : c.priority === 'High' ? 'bg-warning text-dark' : 'bg-secondary'}`} style={{ fontSize: '0.65rem' }}>
                      {c.priority}
                    </span>
                  </div>
                  <p className="text-muted small mb-1">{c.description}</p>
                  <div className="d-flex gap-3 flex-wrap">
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                      <i className="bi bi-person me-1"></i>{c.resident_name}
                    </span>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                      <i className="bi bi-door-closed me-1"></i>Flat {c.flat_id}
                    </span>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                      <i className="bi bi-tag me-1"></i>{c.category}
                    </span>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                      <i className="bi bi-calendar me-1"></i>{c.created_at}
                    </span>
                  </div>
                  {c.remarks && (
                    <div className="mt-2 p-2 rounded" style={{ background: 'rgba(34,197,94,0.1)', fontSize: '0.8rem' }}>
                      <i className="bi bi-chat-right-text me-2 text-success"></i>
                      <span className="text-success">Admin Remarks:</span> {c.remarks}
                    </div>
                  )}
                </div>
                <div className="d-flex flex-column gap-1">
                  {user?.role === 'admin' && (
                    <>
                      <button
                        className="btn btn-sm btn-outline-info"
                        onClick={() => openUpdate(c)}
                        title="Update Status"
                      >
                        <i className="bi bi-pencil-square me-1"></i>Update
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(c.id)}
                        title="Delete"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Raise Complaint Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg" data-bs-theme="dark">
            <div className="modal-content glass-card">
              <div className="modal-header border-secondary border-bottom">
                <h5 className="modal-title fw-bold"><i className="bi bi-exclamation-triangle me-2 text-warning"></i>Raise Complaint</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Your Name</label>
                      <input type="text" className="form-control" placeholder="Resident name" value={formData.resident_name} onChange={e => setFormData({ ...formData, resident_name: e.target.value })} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Flat Number</label>
                      <input type="text" className="form-control" placeholder="e.g. A101" value={formData.flat_id} onChange={e => setFormData({ ...formData, flat_id: e.target.value })} required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Complaint Title</label>
                    <input type="text" className="form-control" placeholder="Short title for the issue" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Category</label>
                      <select className="form-select" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Priority</label>
                      <select className="form-select" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                        {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Description</label>
                    <textarea className="form-control" rows="3" placeholder="Describe the issue in detail..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required></textarea>
                  </div>
                </div>
                <div className="modal-footer border-secondary border-top">
                  <button type="button" className="btn btn-secondary bg-transparent" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary-gradient">Submit Complaint</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal (Admin only) */}
      {updateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" data-bs-theme="dark">
            <div className="modal-content glass-card">
              <div className="modal-header border-secondary border-bottom">
                <h5 className="modal-title fw-bold">Update Complaint #{updateModal.id}</h5>
                <button type="button" className="btn-close" onClick={() => setUpdateModal(null)}></button>
              </div>
              <form onSubmit={handleUpdate}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label text-muted">Update Status</label>
                    <select className="form-select" value={updateData.status} onChange={e => setUpdateData({ ...updateData, status: e.target.value })}>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Admin Remarks</label>
                    <textarea className="form-control" rows="3" placeholder="Resolution notes or remarks..." value={updateData.remarks} onChange={e => setUpdateData({ ...updateData, remarks: e.target.value })}></textarea>
                  </div>
                </div>
                <div className="modal-footer border-secondary border-top">
                  <button type="button" className="btn btn-secondary bg-transparent" onClick={() => setUpdateModal(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary-gradient">Update Complaint</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Complaints;
