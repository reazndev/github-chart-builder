import React from 'react';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <p className="footer-text">
          Built by <a href="https://github.com/reazndev" target="_blank" rel="noopener noreferrer" className="footer-link">@reazndev</a>
          {' • '}
          <a href="https://github.com/reazndev/github-chart-builder" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub Repo</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
