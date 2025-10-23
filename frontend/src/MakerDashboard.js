import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from './AppLayout';
import { getCookie } from './cookieHelper';

const MakerDashboard = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [transactions, setTransactions] = useState([]);
  const username = getCookie('username');
  const role = getCookie('role');

  useEffect(() => {
    if (role !== 'maker') {
      navigate('/');
      return;
    }
    fetchTransactions();
    // eslint-disable-next-line
  }, []);

  const fetchTransactions = async () => {
    const token = getCookie('token');
    const res = await fetch('/api/transfer/my', {
      headers: { token },
      credentials: 'include', // Include cookies in request
    });
    const data = await res.json();
    setTransactions(data);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const token = getCookie('token');
    const res = await fetch('/api/transfer/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token,
      },
      credentials: 'include', // Include cookies in request
      body: JSON.stringify({ amount, recipient }),
    });
    if (res.ok) {
      setAmount('');
      setRecipient('');
      fetchTransactions();
    } else {
      alert('Failed to create transaction');
    }
  };

  return (
    <AppLayout role={role} username={username}>
      <div style={{ margin: '10px 0 20px 0' }}>
        <h2 style={{ color: '#174c86', fontWeight: 600 }}>Maker Dashboard</h2>
        <p style={{ color: '#555' }}>
          Create a new funds transfer below. You can view your recent transfers and their approval status.
        </p>
      </div>
      <form onSubmit={handleSubmit} style={{ marginBottom: 30, display: 'flex', gap: 12 }}>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
          style={{ padding: 9, borderRadius: 5, border: '1px solid #b2c9de', fontSize: 15, width: 120 }}
        />
        <input
          type="text"
          placeholder="Recipient"
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
          required
          style={{ padding: 9, borderRadius: 5, border: '1px solid #b2c9de', fontSize: 15, flex: 1 }}
        />
        <button type="submit" style={{
          background: 'linear-gradient(90deg, #1e599e 60%, #2575bc 100%)',
          color: '#fff',
          fontWeight: 600,
          border: 'none',
          borderRadius: 5,
          fontSize: 15,
          padding: '0 18px'
        }}>
          Initiate Transfer
        </button>
      </form>
      <h3 style={{ color: '#235f99' }}>Your Transfers</h3>
      <table style={{
        borderCollapse: 'collapse', width: '100%', marginTop: 12, fontSize: 15,
        background: '#f8fafb', borderRadius: 6, overflow: 'hidden'
      }}>
        <thead style={{ background: '#eaf2fa' }}>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Amount</th>
            <th style={thStyle}>Recipient</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Approved By</th>
            <th style={thStyle}>Initiated</th>
            <th style={thStyle}>Approved At</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t.transactionId}>
              <td style={tdStyle}>{t.transactionId}</td>
              <td style={tdStyle}>${t.amount}</td>
              <td style={tdStyle}>{t.recipient}</td>
              <td style={tdStyle}>{t.status}</td>
              <td style={tdStyle}>{t.approvedBy || '-'}</td>
              <td style={tdStyle}>{new Date(t.createdAt).toLocaleString()}</td>
              <td style={tdStyle}>{t.approvedAt ? new Date(t.approvedAt).toLocaleString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AppLayout>
  );
};

const thStyle = {
  padding: '8px 10px',
  background: '#eaf2fa',
  borderBottom: '1px solid #b2c9de',
  color: '#235f99'
};
const tdStyle = {
  padding: '8px 10px',
  borderBottom: '1px solid #e7e7e7',
  color: '#2c2c2c'
};

export default MakerDashboard;
