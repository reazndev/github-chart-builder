import React from 'react';

const PreviewCard = ({ hasInput, imgStatus, svgContent, chartMode }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Preview</h2>
      </div>
      <div className="card-content">
        <div className="preview-container">
          {hasInput ? (
            <>
              {imgStatus === 'loading' && (
                <div className="preview-loading">
                  <div className="spinner"></div>
                  <p>Fetching contributions...</p>
                </div>
              )}
              {imgStatus === 'error' && (
                <div className="preview-error">
                  Unable to load contributions chart. Please check the {chartMode === 'user' ? 'username' : 'repositories'} or try again later.
                </div>
              )}
              {imgStatus === 'success' && svgContent && (
                <div
                  className="preview-svg-container"
                  style={{ display: 'block', maxWidth: '100%', overflowX: 'auto' }}
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
              )}
            </>
          ) : (
            <p className="preview-placeholder">
              {chartMode === 'user'
                ? 'Enter a username to preview'
                : 'Enter repository in [username/repo] format (e.g. facebook/react) to preview'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewCard;
