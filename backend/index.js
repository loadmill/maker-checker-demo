const express = require('express');
const path = require('path');
const app = express();
const { expressRecorder } = require('@loadmill/node-recorder');
const PORT = process.env.PORT || 3001;

// Use Loadmill recorder for demo session recording
app.use(expressRecorder({ 
    loadmillCode: process.env.LOADMILL_CODE || '9c18750e-5978-4540-b953-e339c07f5e99',
    notSecure: true, 
    cookieExpiration: 10 * 60 * 1000,
    basePath: 'https://maker-checker-036efc6aec77.herokuapp.com'
}));

// Must come after the Loadmill recorder for raw body capture
app.use(express.json());

// ----- In-memory data -----
const users = [
  { username: 'maker', password: 'maker1234!', role: 'maker' },
  { username: 'checker', password: 'checker1234!', role: 'checker' },
];
let transactions = [];
let auditLog = [];

// ----- Simple session token system -----
const generateToken = (username, role) => `${role}-${username}-token`;
const getUserByToken = (token) => {
  if (!token) return null;
  const [role, username] = token.split('-');
  return users.find(u => u.username === username && u.role === role);
};

// ----- API Endpoints -----

// Login
app.post('/api/login', (req, res) => {
  const { username, password, role } = req.body;
  const user = users.find(
    u => u.username === username 
    && u.password === password
    && u.role === role
  );
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = generateToken(user.username, user.role);
  res.json({ token, role: user.role, username: user.username });
});

// Initiate transfer (Maker only)
app.post('/api/transfer/initiate', (req, res) => {
  const { token } = req.headers;
  const user = getUserByToken(token);
  if (!user || user.role !== 'maker') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const { amount, recipient } = req.body;
  if (!amount || !recipient) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const transactionId = Date.now();
  const t = {
    transactionId,
    amount,
    recipient,
    status: 'PENDING',
    initiatedBy: user.username,
    approvedBy: null,
    createdAt: new Date().toISOString(),
    approvedAt: null,
  };
  transactions.push(t);
  auditLog.push({
    type: 'INITIATE',
    actor: user.username,
    transactionId,
    at: new Date().toISOString(),
  });
  res.json(t);
});

// List all transfers for Maker (Maker only)
app.get('/api/transfer/my', (req, res) => {
  const { token } = req.headers;
  const user = getUserByToken(token);
  if (!user || user.role !== 'maker') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  res.json(transactions.filter(t => t.initiatedBy === user.username));
});

// List pending transfers (Checker only)
app.get('/api/transfer/pending', (req, res) => {
  const { token } = req.headers;
  const user = getUserByToken(token);
  if (!user || user.role !== 'checker') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  res.json(transactions.filter(t => t.status === 'PENDING'));
});

// Approve a transfer (Checker only)
app.post('/api/transfer/approve', (req, res) => {
  const { token } = req.headers;
  const user = getUserByToken(token);
  if (!user || user.role !== 'checker') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const { transactionId } = req.body;
  const t = transactions.find(tx => tx.transactionId == transactionId);
  if (!t) return res.status(404).json({ error: 'Transaction not found' });
  if (t.status !== 'PENDING') {
    return res.status(400).json({ error: 'Already processed' });
  }
  t.status = 'APPROVED';
  t.approvedBy = user.username;
  t.approvedAt = new Date().toISOString();
  auditLog.push({
    type: 'APPROVE',
    actor: user.username,
    transactionId,
    at: new Date().toISOString(),
  });
  res.json(t);
});

// Get transaction by ID (any logged-in user)
app.get('/api/transfer/:transactionId', (req, res) => {
  const { token } = req.headers;
  if (!getUserByToken(token)) return res.status(403).json({ error: 'Unauthorized' });
  const t = transactions.find(tx => tx.transactionId == req.params.transactionId);
  if (!t) return res.status(404).json({ error: 'Transaction not found' });
  res.json(t);
});

// Reject a transfer (Checker only)
app.post('/api/transfer/reject', (req, res) => {
  const { token } = req.headers;
  const user = getUserByToken(token);
  if (!user || user.role !== 'checker') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const { transactionId } = req.body;
  const t = transactions.find(tx => tx.transactionId == transactionId);
  if (!t) return res.status(404).json({ error: 'Transaction not found' });
  if (t.status !== 'PENDING') {
    return res.status(400).json({ error: 'Already processed' });
  }
  t.status = 'REJECTED';
  t.approvedBy = user.username;
  t.approvedAt = new Date().toISOString();
  auditLog.push({
    type: 'REJECT',
    actor: user.username,
    transactionId,
    at: new Date().toISOString(),
  });
  res.json(t);
});

// Mock audit log
app.get('/api/audit', (req, res) => {
  res.json(auditLog);
});

// --- Serve frontend ---
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// New payment flow
// 1. Maker initiates transfer with additional "description" field
// 2. Checker can see the description when approving/rejecting
// 3. Audit log includes the description for each transaction     