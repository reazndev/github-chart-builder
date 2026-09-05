import React from 'react';
import { Github, LogOut } from 'lucide-react';

const Header = ({ auth, handleLogin, handleLogout, route, navigate }) => {
  return (
    <header className="header">
      <div className="header-container">
        <button
          type="button"
          className="header-brand"
          onClick={() => navigate('/')}
          aria-label="Go to builder"
        >
          <Github className="header-icon" aria-hidden="true" />
          <span>
            <h1 className="header-title">Contributions Chart Builder</h1>
            <p className="header-subtitle">Customize your GitHub contribution graph</p>
          </span>
        </button>
        <div className="header-actions">
          <nav className="header-nav" aria-label="Primary">
            <button
              type="button"
              onClick={() => navigate('/')}
              className={`header-nav-link ${route === 'builder' ? 'active' : ''}`}
              aria-current={route === 'builder' ? 'page' : undefined}
            >
              Builder
            </button>
            <button
              type="button"
              onClick={() => navigate('/themes')}
              className={`header-nav-link ${route === 'themes' ? 'active' : ''}`}
              aria-current={route === 'themes' ? 'page' : undefined}
            >
              Themes
            </button>
            <button
              type="button"
              onClick={() => navigate('/about')}
              className={`header-nav-link ${route === 'about' ? 'active' : ''}`}
              aria-current={route === 'about' ? 'page' : undefined}
            >
              About
            </button>
          </nav>
          {auth.token ? (
            <div className="user-profile-badge">
              <span className="user-profile-name">
                @{auth.username}
              </span>
              <button
                onClick={handleLogout}
                className="btn-auth-logout"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="auth-btn-icon" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button onClick={handleLogin} className="btn-auth-login">
              <Github className="auth-btn-icon" aria-hidden="true" />
              <span>Include Private Repos</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
