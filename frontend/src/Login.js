import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from './AppLayout';

const roleOptions = [
  { value: 'maker', label: 'Maker (Finance Officer)' },
  { value: 'checker', label: 'Checker (Finance Manager)' },
];

const CustomDropdown = ({ value, onChange, style }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClick = e => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={wrapperRef} style={{ ...style, position: 'relative', cursor: 'pointer', padding: 0 }}>
      <div
        tabIndex={0}
        style={{
          ...styles.input,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingRight: 24,
          cursor: 'pointer',
          marginBottom: 0,
          background: '#fff'

        }}
        onClick={() => setOpen(open => !open)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') setOpen(open => !open);
        }}
      >
        {roleOptions.find(o => o.value === value)?.label}
        <span
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: '#444',
            fontSize: 18,
          }}
        >▼</span>

      </div>
      {open && (
        <div style={dropdownStyle}>
          {roleOptions.map(option => (
            <div
              key={option.value}
              style={{
                padding: '8px 12px',
                background: option.value === value ? '#e6f0fa' : '#fff',
                cursor: 'pointer'
              }}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const dropdownStyle = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  background: '#fff',
  border: '1px solid #b2c9de',
  borderRadius: 5,
  zIndex: 10,
  marginTop: 3,
  boxShadow: '0 2px 8px rgba(60,100,140,0.05)',
};

const Login = () => {
  const [role, setRole] = useState('maker');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async e => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role }),
      credentials: 'include', // Important: include cookies in request
    });
    const data = await res.json();
    if (res.ok && data.token) {
      // Cookies are now set by the backend. Redirect based on role.
      navigate(`/${data.role}`);
    } else {
      alert(data.error || 'Login failed');
    }
  };

  return (
    <AppLayout>
      <div style={styles.loginBox}>
        <h2 style={{ color: '#174c86', fontWeight: 600, marginBottom: 25 }}>Banking Approval Demo Login</h2>
        <form onSubmit={handleLogin}>
          <div style={styles.row}>
            <label style={styles.label}>Role</label>
            <CustomDropdown value={role} onChange={setRole} style={styles.input} />
          </div>
          <div style={styles.row}>
            <label style={styles.label}>Username</label>
            <input type="text" required value={username} onChange={e => setUsername(e.target.value)} style={styles.input} />
          </div>
          <div style={styles.row}>
            <label style={styles.label}>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={styles.input} />
          </div>
          <button type="submit" style={styles.button}>Login</button>
        </form>
        <div style={styles.demo}>
          Demo users:
          <div><b>maker</b> / <b>maker1234!</b></div>
          <div><b>checker</b> / <b>checker1234!</b></div>
        </div>
      </div>
    </AppLayout>
  );
};

const styles = {
  loginBox: {
    margin: '40px auto',
    maxWidth: 350,
    background: '#f6faff',
    border: '1px solid #d6e2ef',
    borderRadius: 10,
    boxShadow: '0 2px 12px rgba(60,100,140,0.04)',
    padding: '40px 32px'
  },
  row: {
    marginBottom: 18
  },
  label: {
    display: 'block',
    color: '#235f99',
    fontWeight: 500,
    marginBottom: 5,
    fontSize: 15
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid #b2c9de',
    borderRadius: 5,
    fontSize: 15,
    marginBottom: 3,
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    padding: '11px 0',
    background: 'linear-gradient(90deg, #1e599e 60%, #2575bc 100%)',
    color: '#fff',
    fontWeight: 600,
    border: 'none',
    borderRadius: 5,
    fontSize: 16,
    letterSpacing: 1,
    cursor: 'pointer',
    marginTop: 10
  },
  demo: {
    marginTop: 22,
    color: '#888',
    fontSize: 14,
    lineHeight: 1.5
  }
};

export default Login;
