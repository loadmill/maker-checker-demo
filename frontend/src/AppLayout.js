import React from 'react';

const menuLinks = [
  { label: 'Accounts', path: '#' },
  { label: 'Transfers', path: '#' },
  { label: 'Approvals', path: '#' },
  { label: 'Logout', path: '/', right: true }
];

const AppLayout = ({ children, role, username }) => {
  return (
    <div style={styles.appBg}>
      <header style={styles.header}>
        <div style={styles.logo}>
          {/* Make the logo clickable */}
          <a href="/" style={styles.logoLink}>
            <span style={{
              fontWeight: 'bold',
              fontSize: 24,
              letterSpacing: 2,
              color: '#174c86',
              textDecoration: 'none'
            }}>
              Demo Bank
            </span>
          </a>
        </div>
        <nav style={styles.nav}>
          {menuLinks.map(link => (
            <a
              key={link.label}
              href={link.path}
              style={{
                ...styles.navLink,
                marginLeft: link.right ? 'auto' : 0
              }}
              onClick={async (e) => {
                if (link.label === 'Logout') {
                  e.preventDefault();
                  try {
                    await fetch('/api/logout', {
                      method: 'POST',
                      credentials: 'include',
                    });
                    // Small delay to ensure Loadmill recorder captures the request
                    await new Promise(resolve => setTimeout(resolve, 100));
                  } catch (err) {
                    console.error('Logout error:', err);
                  }
                  window.location.href = '/';
                }
              }}
            >
              {link.label}
            </a>
          ))}
          {username && (
            <span style={styles.userBox}>
              <b>{username}</b> {role && <span style={{ color: '#888' }}>({role})</span>}
            </span>
          )}
        </nav>
      </header>
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
};

const styles = {
  appBg: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f4f7fb 0%, #e8eff8 100%)',
    fontFamily: 'Segoe UI, Arial, sans-serif'
  },
  header: {
    background: '#fff',
    borderBottom: '1px solid #e0e5ea',
    boxShadow: '0 2px 8px rgba(30,60,90,0.04)',
    padding: '0 32px',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    zIndex: 1
  },
  logo: {
    marginRight: 36
  },
  logoLink: {
    textDecoration: 'none'
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    flex: 1
  },
  navLink: {
    textDecoration: 'none',
    color: '#235f99',
    fontWeight: 500,
    fontSize: 16,
    padding: '0 18px',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    borderBottom: '2px solid transparent',
    transition: 'border-color 0.2s',
    cursor: 'pointer'
  },
  userBox: {
    marginLeft: 18,
    fontSize: 15,
    color: '#235f99'
  },
  main: {
    maxWidth: 850,
    margin: '40px auto',
    padding: 24,
    background: '#fff',
    borderRadius: 10,
    boxShadow: '0 2px 16px rgba(40,64,100,0.07)'
  }
};

export default AppLayout;
