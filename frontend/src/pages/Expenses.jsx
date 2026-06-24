import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Security', 'Water', 'Electricity', 'Cleaning', 'Repairs', 'Maintenance', 'Other'];

const CATEGORY_ICONS = {
  Security: 'bi-shield-check',
  Water: 'bi-droplet-fill',
  Electricity: 'bi-lightning-fill',
  Cleaning: 'bi-stars',
  Repairs: 'bi-tools',
  Maintenance: 'bi-gear-fill',
  Other: 'bi-three-dots'
};

function Expenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({ category: 'Security', amount: 0, description: '' });
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/expenses');
      setExpenses(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editExpense) {
        await axios.put(`http://127.0.0.1:5000/api/expenses/${editExpense.id}`, formData);
      } else {
        await axios.post('http://127.0.0.1:5000/api/expenses', formData);
      }
      closeModal();
      fetchExpenses();
    } catch (err) { alert("Error saving expense"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await axios.delete(`http://127.0.0.1:5000/api/expenses/${id}`);
      fetchExpenses();
    } catch (err) { alert("Error deleting expense"); }
  };

  const openEdit = (expense) => {
    setEditExpense(expense);
    setFormData({ category: expense.category, amount: expense.amount, description: expense.description || '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditExpense(null);
    setFormData({ category: 'Security', amount: 0, description: '' });
  };

  // Summary by category
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categoryTotals = CATEGORIES.map(cat => ({
    name: cat,
    total: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
  })).filter(c => c.total > 0);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <p className="text-muted mb-0">Apartment expense tracker (₹)</p>
        {user?.role === 'admin' && (
          <button className="btn btn-primary-gradient" onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-lg me-1"></i> Add Expense
          </button>
        )}
      </div>

      {/* Total + Category Summary */}
      <div className="row mb-4">
        <div className="col-12 col-md-4 mb-3">
          <div className="glass-card p-4 text-center">
            <div className="stat-icon mb-2"><i className="bi bi-graph-down-arrow"></i></div>
            <h3 className="fw-bold mb-1">₹{totalExpenses.toLocaleString('en-IN')}</h3>
            <p className="text-muted mb-0 small">Total Expenses</p>
          </div>
        </div>
        <div className="col-12 col-md-8 mb-3">
          <div className="glass-card p-4 h-100">
            <h6 className="fw-bold mb-3">Expense Breakdown by Category</h6>
            {categoryTotals.length === 0 ? (
              <p className="text-muted small">No expenses recorded yet.</p>
            ) : (
              categoryTotals.map(c => (
                <div key={c.name} className="mb-2">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="small">
                      <i className={`bi ${CATEGORY_ICONS[c.name] || 'bi-circle'} me-2 text-primary`}></i>
                      {c.name}
                    </span>
                    <span className="small fw-bold text-danger">₹{c.total.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="progress" style={{ height: '6px', background: 'rgba(255,255,255,0.1)' }}>
                    <div
                      className="progress-bar"
                      style={{
                        width: `${totalExpenses > 0 ? (c.total / totalExpenses * 100) : 0}%`,
                        background: 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                      }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="glass-card p-4">
        <div className="table-responsive">
          <table className="table table-borderless table-glass text-center align-middle">
            <thead>
              <tr>
                <th>Expense ID</th>
                <th>Date</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Description</th>
                {user?.role === 'admin' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr><td colSpan="6" className="text-muted py-4">No expenses recorded.</td></tr>
              ) : (
                expenses.map(e => (
                  <tr key={e.id}>
                    <td className="fw-bold">#EXP-{e.id}</td>
                    <td>{e.date}</td>
                    <td>
                      <span className="badge bg-dark border border-secondary text-primary">
                        <i className={`bi ${CATEGORY_ICONS[e.category] || 'bi-circle'} me-1`}></i>
                        {e.category}
                      </span>
                    </td>
                    <td className="fw-bold text-danger">₹{e.amount.toLocaleString('en-IN')}</td>
                    <td className="text-muted">{e.description || '-'}</td>
                    {user?.role === 'admin' && (
                      <td>
                        <div className="d-flex gap-1 justify-content-center">
                          <button className="btn btn-sm btn-outline-warning" onClick={() => openEdit(e)} title="Edit">
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(e.id)} title="Delete">
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" data-bs-theme="dark">
            <div className="modal-content glass-card">
              <div className="modal-header border-secondary border-bottom">
                <h5 className="modal-title fw-bold">
                  {editExpense ? `Edit Expense #EXP-${editExpense.id}` : 'Record Expense'}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Category</label>
                      <select className="form-select" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Amount (₹)</label>
                      <input type="number" step="0.01" className="form-control" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Description (Optional)</label>
                    <textarea className="form-control" rows="2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                  </div>
                </div>
                <div className="modal-footer border-secondary border-top">
                  <button type="button" className="btn btn-secondary bg-transparent" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary-gradient">
                    {editExpense ? 'Update Expense' : 'Save Expense'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Expenses;
