import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Residents() {
  const { user } = useAuth();
  const [residents, setResidents] = useState([]);
  const [flats, setFlats] = useState([]);
  const [formData, setFormData] = useState({ name: '', flat_id: '', phone: '', members: 1 });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchResidents();
    fetchFlats();
  }, []);

  const fetchResidents = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/residents');
      setResidents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFlats = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/flats');
      setFlats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove resident "${name}"? Their flat will be marked as Vacant.`)) return;
    try {
      await axios.delete(`http://127.0.0.1:5000/api/residents/${id}`);
      fetchResidents();
      fetchFlats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Only allow occupied flats or vacant flats
      await axios.post('http://127.0.0.1:5000/api/residents', formData);
      setShowModal(false);
      setFormData({ name: '', flat_id: '', phone: '', members: 1 });
      fetchResidents();
      fetchFlats();
    } catch (err) {
      console.error(err);
    }
  };

  const vacantFlats = flats.filter(f => f.status === 'Vacant');

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <p className="text-muted mb-0">Manage all apartment residents</p>
        {user?.role === 'admin' && (
          <button className="btn btn-primary-gradient" onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-lg me-1"></i> Add Resident
          </button>
        )}
      </div>

      <div className="glass-card p-4">
        <div className="table-responsive">
          <table className="table table-borderless table-glass text-center align-middle">
            <thead>
              <tr>
                <th className="text-start">Resident Name</th>
                <th>Flat Number</th>
                <th>Phone Number</th>
                <th>Family Members</th>
                {user?.role === 'admin' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {residents.length === 0 ? (
                <tr><td colSpan="5" className="text-muted py-4">No residents found.</td></tr>
              ) : (
                residents.map(r => (
                  <tr key={r.id}>
                    <td className="fw-bold text-start">
                      <i className="bi bi-person-circle text-primary me-2"></i>{r.name}
                    </td>
                    <td>
                      <span className="badge bg-dark border border-secondary text-primary">{r.flat_id}</span>
                    </td>
                    <td>{r.phone}</td>
                    <td>
                      <span className="badge bg-secondary">
                        <i className="bi bi-people me-1"></i>{r.members}
                      </span>
                    </td>
                    {user?.role === 'admin' && (
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(r.id, r.name)}
                          title="Remove Resident"
                        >
                          <i className="bi bi-person-x me-1"></i>Remove
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Resident Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" data-bs-theme="dark">
            <div className="modal-content glass-card">
              <div className="modal-header border-secondary border-bottom">
                <h5 className="modal-title fw-bold">New Resident Entry</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label text-muted">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Assign Flat</label>
                    <select
                      className="form-select"
                      value={formData.flat_id}
                      onChange={e => setFormData({ ...formData, flat_id: e.target.value })}
                      required
                    >
                      <option value="">Select a flat...</option>
                      {flats.map(f => (
                        <option key={f.id} value={f.flat_id} disabled={f.status === 'Occupied'}>
                          {f.flat_id} - Block {f.block} ({f.type}) {f.status === 'Occupied' ? '— Occupied' : '— Vacant'}
                        </option>
                      ))}
                    </select>
                    {vacantFlats.length === 0 && (
                      <small className="text-warning mt-1 d-block">
                        <i className="bi bi-exclamation-triangle me-1"></i>No vacant flats available. Add flats first.
                      </small>
                    )}
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="10-digit number"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Family Members</label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        value={formData.members}
                        onChange={e => setFormData({ ...formData, members: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-secondary border-top">
                  <button type="button" className="btn btn-secondary bg-transparent" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary-gradient">Save Resident</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Residents;
