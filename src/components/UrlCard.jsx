import React from 'react';
import { Copy, Check } from 'lucide-react';

const UrlCard = ({ previewUrl, copyToClipboard, copied }) => {
  return (
    <section className="card" aria-labelledby="url-title">
      <div className="card-header">
        <h2 className="card-title" id="url-title">Generated URL</h2>
      </div>
      <div className="card-content">
        <div className="url-container">
          <div className="url-display">
            <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="url-link">
              {previewUrl}
            </a>
          </div>
          <button onClick={copyToClipboard} className="copy-url-btn" aria-live="polite">
            {copied ? <Check className="btn-icon" aria-hidden="true" /> : <Copy className="btn-icon" aria-hidden="true" />}
            {copied ? 'Copied' : 'Copy URL'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default UrlCard;
