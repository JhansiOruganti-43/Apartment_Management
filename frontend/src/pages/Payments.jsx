import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Payments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [bills, setBills] = useState([]);
  const [allBills, setAllBills] = useState([]);
  const [formData, setFormData] = useState({ bill_id: '', amount: 0, payment_mode: 'Cash', transaction_id: '' });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchBills();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/payments');
      setPayments(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchBills = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/bills');
      setAllBills(res.data);
      setBills(res.data.filter(b => b.status === 'Pending'));
    } catch (err) { console.error(err); }
  };

  const handleBillSelect = (e) => {
    const selectedId = e.target.value;
    const selectedBill = bills.find(b => b.id.toString() === selectedId);
    setFormData({ ...formData, bill_id: selectedId, amount: selectedBill ? selectedBill.total_amount : 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:5000/api/payments', formData);
      setShowModal(false);
      setFormData({ bill_id: '', amount: 0, payment_mode: 'Cash', transaction_id: '' });
      fetchPayments();
      fetchBills();
    } catch (err) { alert("Error recording payment"); }
  };

  const getBillDetails = (bill_id) => allBills.find(b => b.id === bill_id);

  const printReceipt = (payment) => {
    const bill = getBillDetails(payment.bill_id);
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Receipt ${payment.payment_ref}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #111; max-width: 500px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #22c55e; padding-bottom: 20px; margin-bottom: 20px; }
        .header h1 { color: #6366f1; margin: 0 0 5px; }
        .receipt-badge { background: #dcfce7; color: #166534; padding: 4px 16px; border-radius: 20px; font-weight: bold; display: inline-block; margin-bottom: 10px; }
        .row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .label { color: #666; }
        .amount { font-size: 1.5rem; font-weight: bold; color: #22c55e; text-align: center; margin: 20px 0; }
        @media print { button { display: none; } }
      </style></head><body>
      <div class="header">
        <h1>🏢 Apt Manager</h1>
        <div class="receipt-badge">✅ PAYMENT RECEIPT</div>
        <p>${payment.payment_ref}</p>
      </div>
      <div class="amount">₹${payment.amount.toLocaleString('en-IN')}</div>
      <div class="row"><span class="label">Payment ID</span><span><b>${payment.payment_ref}</b></span></div>
      <div class="row"><span class="label">Bill ID</span><span>#BL-${payment.bill_id}</span></div>
      ${bill ? `<div class="row"><span class="label">Flat Number</span><span>${bill.flat_id}</span></div>` : ''}
      ${bill ? `<div class="row"><span class="label">Billing Period</span><span>${bill.month} ${bill.year}</span></div>` : ''}
      <div class="row"><span class="label">Payment Mode</span><span>${payment.payment_mode}</span></div>
      <div class="row"><span class="label">Transaction ID</span><span>${payment.transaction_id || 'N/A'}</span></div>
      <div class="row"><span class="label">Date & Time</span><span>${payment.payment_date}</span></div>
      <div class="row"><span class="label">Status</span><span style="color:#166534;font-weight:bold">✅ PAID</span></div>
      <p style="text-align:center;margin-top:30px;color:#999;font-size:0.75rem">Thank you for your payment! — Apt Manager</p>
      <button onclick="window.print()" style="margin:20px auto;display:block;padding:10px 30px;background:#22c55e;color:white;border:none;border-radius:8px;cursor:pointer;font-size:1rem">🖨️ Print / Save PDF</button>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <p className="text-muted mb-0">Payment records & receipts</p>
        {user?.role === 'admin' && (
          <button className="btn btn-primary-gradient" onClick={() => setShowModal(true)}>
            <i className="bi bi-wallet2 me-1"></i> Record Payment
          </button>
        )}
      </div>

      <div className="glass-card p-4">
        <div className="table-responsive">
          <table className="table table-borderless table-glass text-center align-middle">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Bill ID</th>
                <th>Flat</th>
                <th>Amount</th>
                <th>Mode</th>
                <th>Date</th>
                <th>Transaction Ref</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan="8" className="text-muted py-4">No payments recorded.</td></tr>
              ) : (
                payments.map(p => {
                  const bill = getBillDetails(p.bill_id);
                  return (
                    <tr key={p.id}>
                      <td className="fw-bold text-primary">{p.payment_ref}</td>
                      <td>#BL-{p.bill_id}</td>
                      <td>
                        {bill ? (
                          <span className="badge bg-dark border border-secondary text-primary">{bill.flat_id}</span>
                        ) : '-'}
                      </td>
                      <td className="fw-bold text-success">₹{p.amount.toLocaleString('en-IN')}</td>
                      <td>
                        <span className="badge bg-secondary">{p.payment_mode}</span>
                      </td>
                      <td className="small">{p.payment_date}</td>
                      <td className="text-muted small">{p.transaction_id || '-'}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => printReceipt(p)}
                          title="Download Receipt"
                        >
                          <i className="bi bi-download me-1"></i>Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" data-bs-theme="dark">
            <div className="modal-content glass-card">
              <div className="modal-header border-secondary border-bottom">
                <h5 className="modal-title fw-bold">Record Payment</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label text-muted">Select Pending Bill</label>
                    <select className="form-select" value={formData.bill_id} onChange={handleBillSelect} required>
                      <option value="">Choose...</option>
                      {bills.map(b => (
                        <option key={b.id} value={b.id}>
                          #BL-{b.id} (Flat {b.flat_id} - {b.month} {b.year}) — ₹{b.total_amount.toLocaleString('en-IN')}
                        </option>
                      ))}
                    </select>
                    {bills.length === 0 && (
                      <small className="text-success mt-1 d-block">
                        <i className="bi bi-check-circle me-1"></i>All bills are paid!
                      </small>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Amount Paid (₹)</label>
                    <input type="number" step="0.01" className="form-control" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Payment Mode</label>
                      <select className="form-select" value={formData.payment_mode} onChange={e => setFormData({ ...formData, payment_mode: e.target.value })}>
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Card">Card</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Transaction ID (Optional)</label>
                      <input type="text" className="form-control" placeholder="UPI/Transfer ref..." value={formData.transaction_id} onChange={e => setFormData({ ...formData, transaction_id: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-secondary border-top">
                  <button type="button" className="btn btn-secondary bg-transparent" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary-gradient">
                    <i className="bi bi-check-circle me-1"></i>Confirm Payment
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

export default Payments;
