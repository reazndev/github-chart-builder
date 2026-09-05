import React from 'react';

const PreviewCard = ({ hasInput, imgStatus, svgContent, chartMode }) => {
  return (
    <section className="card" aria-labelledby="preview-title">
      <div className="card-header">
        <h2 className="card-title" id="preview-title">Preview</h2>
      </div>
      <div className="card-content">
        <div className="preview-container">
          {hasInput ? (
            <>
              {imgStatus === 'loading' && (
                <div className="preview-loading" role="status">
                  <div className="spinner" aria-hidden="true"></div>
                  <p>Fetching contributions...</p>
                </div>
              )}
              {imgStatus === 'error' && (
                <div className="preview-error" role="alert">
                  Unable to load contributions chart. Please check the {chartMode === 'user' ? 'username' : 'repositories'} or try again later.
                </div>
              )}
              {imgStatus === 'success' && svgContent && (
                <div
                  className="preview-svg-container"
                  style={{ display: 'block', maxWidth: '100%', overflowX: 'auto' }}
                  role="img"
                  aria-label="GitHub contributions chart preview"
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
    </section>
  );
};

export default PreviewCard;
