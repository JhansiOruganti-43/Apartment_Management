import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Flats() {
  const { user } = useAuth();
  const [flats, setFlats] = useState([]);
  const [formData, setFormData] = useState({ flat_id: '', block: '', floor: 1, type: '1BHK' });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchFlats();
  }, []);

  const fetchFlats = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/flats');
      setFlats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:5000/api/flats', formData);
      setShowModal(false);
      setFormData({ flat_id: '', block: '', floor: 1, type: '1BHK' });
      fetchFlats();
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  const totalFlats = flats.length;
  const occupiedFlats = flats.filter(f => f.status === 'Occupied').length;
  const vacantFlats = flats.filter(f => f.status === 'Vacant').length;
  const vacantList = flats.filter(f => f.status === 'Vacant');

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <p className="text-muted mb-0">Apartment structure & occupancy</p>
        {user?.role === 'admin' && (
          <button className="btn btn-primary-gradient" onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-lg me-1"></i> Add Flat
          </button>
        )}
      </div>

      {/* Occupancy Summary Cards */}
      <div className="row mb-4">
        <div className="col-4">
          <div className="glass-card p-4 text-center">
            <div className="stat-icon mb-2"><i className="bi bi-buildings"></i></div>
            <h3 className="fw-bold mb-1">{totalFlats}</h3>
            <p className="text-muted mb-0 small">Total Flats</p>
          </div>
        </div>
        <div className="col-4">
          <div className="glass-card p-4 text-center">
            <div className="mb-2" style={{ fontSize: '2rem', color: '#22c55e' }}>
              <i className="bi bi-door-closed-fill"></i>
            </div>
            <h3 className="fw-bold mb-1" style={{ color: '#22c55e' }}>{occupiedFlats}</h3>
            <p className="text-muted mb-0 small">Occupied</p>
          </div>
        </div>
        <div className="col-4">
          <div className="glass-card p-4 text-center">
            <div className="mb-2" style={{ fontSize: '2rem', color: '#f59e0b' }}>
              <i className="bi bi-door-open-fill"></i>
            </div>
            <h3 className="fw-bold mb-1" style={{ color: '#f59e0b' }}>{vacantFlats}</h3>
            <p className="text-muted mb-0 small">Vacant</p>
          </div>
        </div>
      </div>

      {/* All Flats Grid */}
      <div className="glass-card p-4 mb-4">
        <h6 className="fw-bold mb-3"><i className="bi bi-grid me-2"></i>All Flats</h6>
        <div className="row">
          {flats.length === 0 ? (
            <div className="col-12 text-center text-muted py-4">No flats found. Add one to get started!</div>
          ) : (
            flats.map(f => (
              <div className="col-6 col-md-4 col-lg-3 mb-3" key={f.id}>
                <div className={`glass-card p-3 text-center h-100 flat-card ${f.status === 'Occupied' ? 'flat-occupied' : 'flat-vacant'}`}>
                  <i className={`bi ${f.status === 'Occupied' ? 'bi-door-closed-fill' : 'bi-door-open-fill'} fs-2 mb-2 d-block`}></i>
                  <h6 className="fw-bold mb-1">{f.flat_id}</h6>
                  <p className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>Block {f.block} | Floor {f.floor}</p>
                  <div className="d-flex gap-1 justify-content-center flex-wrap">
                    <span className="badge bg-dark border border-secondary text-primary" style={{ fontSize: '0.65rem' }}>{f.type}</span>
                    <span className={`badge ${f.status === 'Occupied' ? 'bg-success' : 'bg-warning text-dark'}`} style={{ fontSize: '0.65rem' }}>
                      {f.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Vacancy List */}
      <div className="glass-card p-4">
        <h6 className="fw-bold mb-3"><i className="bi bi-list-ul me-2 text-warning"></i>Vacancy List</h6>
        {vacantList.length === 0 ? (
          <div className="text-center text-muted py-3">
            <i className="bi bi-check-circle-fill text-success fs-3 d-block mb-2"></i>
            All flats are occupied!
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-borderless table-glass text-center align-middle">
              <thead>
                <tr>
                  <th>Flat No.</th>
                  <th>Block</th>
                  <th>Floor</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {vacantList.map(f => (
                  <tr key={f.id}>
                    <td className="fw-bold">{f.flat_id}</td>
                    <td>Block {f.block}</td>
                    <td>{f.floor}</td>
                    <td><span className="badge bg-secondary">{f.type}</span></td>
                    <td><span className="badge bg-warning text-dark">Vacant</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Flat Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" data-bs-theme="dark">
            <div className="modal-content glass-card">
              <div className="modal-header border-secondary border-bottom">
                <h5 className="modal-title fw-bold">Register Flat</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Flat No</label>
                      <input type="text" className="form-control" value={formData.flat_id} onChange={e => setFormData({ ...formData, flat_id: e.target.value })} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Block</label>
                      <input type="text" className="form-control" value={formData.block} onChange={e => setFormData({ ...formData, block: e.target.value })} required />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Floor</label>
                      <input type="number" className="form-control" min="0" value={formData.floor} onChange={e => setFormData({ ...formData, floor: e.target.value })} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Type</label>
                      <select className="form-select" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                        <option value="1BHK">1BHK</option>
                        <option value="2BHK">2BHK</option>
                        <option value="3BHK">3BHK</option>
                        <option value="Penthouse">Penthouse</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-secondary border-top">
                  <button type="button" className="btn btn-secondary bg-transparent" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary-gradient">Save Flat</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Flats;
