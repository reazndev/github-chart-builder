import React from 'react';
import { Github, LogOut } from 'lucide-react';

const Header = ({ auth, handleLogin, handleLogout }) => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-title-section">
          <Github className="header-icon" />
          <div>
            <h1 className="header-title">Contributions Chart Builder</h1>
            <p className="header-subtitle">Customize your GitHub contribution graph</p>
          </div>
        </div>
        <div className="header-actions">
          {auth.token ? (
            <div className="user-profile-badge">
              <span className="user-profile-name">
                @{auth.username}
              </span>
              <button
                onClick={handleLogout}
                className="btn-auth-logout"
                title="Sign out"
              >
                <LogOut className="auth-btn-icon" />
              </button>
            </div>
          ) : (
            <button onClick={handleLogin} className="btn-auth-login">
              <Github className="auth-btn-icon" />
              <span>Include Private Repos</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
