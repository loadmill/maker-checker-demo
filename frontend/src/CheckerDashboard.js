import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from './AppLayout';
import { getCookie } from './cookieHelper';

const CheckerDashboard = () => {
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);
  const role = getCookie('role');
  const username = getCookie('username');

  useEffect(() => {
    if (role !== 'checker') {
      navigate('/');
      return;
    }
    fetchPending();
    const interval = setInterval(fetchPending, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  const fetchPending = async () => {
    const token = getCookie('token');
    const res = await fetch('/api/transfer/pending', {
      headers: { token },
      credentials: 'include', // Include cookies in request
    });
    const data = await res.json();
    setPending(data);
  };

  const approve = async transactionId => {
    const token = getCookie('token');
    const res = await fetch('/api/transfer/approve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token,
      },
      credentials: 'include', // Include cookies in request
      body: JSON.stringify({ transactionId }),
    });
    if (res.ok) fetchPending();
    else alert('Approval failed');
  };

  const reject = async transactionId => {
    const token = getCookie('token');
    const res = await fetch('/api/transfer/reject', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token,
      },
      credentials: 'include', // Include cookies in request
      body: JSON.stringify({ transactionId }),
    });
    if (res.ok) fetchPending();
    else alert('Rejection failed');
  };

  return (
    <AppLayout role={role} username={username}>
      <div style={{ margin: '10px 0 20px 0' }}>
        <h2 style={{ color: '#174c86', fontWeight: 600 }}>Checker Dashboard</h2>
        <p style={{ color: '#555' }}>
          Review and approve or reject pending funds transfers below.
        </p>
      </div>
      <h3 style={{ color: '#235f99' }}>Pending Transfers</h3>
      <table style={{
        borderCollapse: 'collapse', width: '100%', marginTop: 12, fontSize: 15,
        background: '#f8fafb', borderRadius: 6, overflow: 'hidden'
      }}>
        <thead style={{ background: '#eaf2fa' }}>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Amount</th>
            <th style={thStyle}>Recipient</th>
            <th style={thStyle}>Initiated By</th>
            <th style={thStyle}>Initiated At</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Action</th>
          </tr>
        </thead>
        <tbody>
          {pending.length === 0 ? (
            <tr>
              <td style={tdStyle} colSpan={7}>No pending transfers.</td>
            </tr>
          ) : (
            pending.map(t => (
              <tr key={t.transactionId}>
                <td style={tdStyle}>{t.transactionId}</td>
                <td style={tdStyle}>${t.amount}</td>
                <td style={tdStyle}>{t.recipient}</td>
                <td style={tdStyle}>{t.initiatedBy}</td>
                <td style={tdStyle}>{new Date(t.createdAt).toLocaleString()}</td>
                <td style={tdStyle}>{t.status}</td>
                <td style={tdStyle}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    minWidth: 100
                  }}>
                    <button
                      onClick={() => approve(t.transactionId)}
                      style={approveButtonStyle}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => reject(t.transactionId)}
                      style={rejectButtonStyle}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
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
  color: '#2c2c2c',
  textAlign: 'center'
};
const approveButtonStyle = {
  background: 'linear-gradient(90deg, #1e599e 60%, #2575bc 100%)',
  color: '#fff',
  fontWeight: 600,
  border: 'none',
  borderRadius: 5,
  fontSize: 15,
  padding: '10px 0',
  width: '100%',
  cursor: 'pointer'
};
const rejectButtonStyle = {
  background: 'linear-gradient(90deg, #be2929 60%, #cc4747 100%)',
  color: '#fff',
  fontWeight: 600,
  border: 'none',
  borderRadius: 5,
  fontSize: 15,
  padding: '10px 0',
  width: '100%',
  cursor: 'pointer'
};

export default CheckerDashboard;
