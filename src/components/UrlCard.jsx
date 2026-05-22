import React from 'react';
import { Copy, Check } from 'lucide-react';

const UrlCard = ({ previewUrl, copyToClipboard, copied }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Generated URL</h2>
      </div>
      <div className="card-content">
        <div className="url-container">
          <div className="url-display">
            <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="url-link">
              {previewUrl}
            </a>
          </div>
          <button onClick={copyToClipboard} className="copy-url-btn">
            {copied ? <Check className="btn-icon" /> : <Copy className="btn-icon" />}
            {copied ? 'Copied' : 'Copy URL'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UrlCard;
