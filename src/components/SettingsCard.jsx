import React from 'react';
import { Settings, Lock } from 'lucide-react';
import RepoInputs from './RepoInputs';

const SettingsCard = ({
  auth,
  config,
  handleChange,
  chartMode,
  setChartMode,
  durationMode,
  setDurationMode,
  customRange,
  setCustomRange,
  repoList,
  handleRepoChange,
  handleRemoveRepo,
  activeInputIndex,
  setActiveInputIndex,
  activeSuggestionIndex,
  setActiveSuggestionIndex,
  fetchingUserRepos,
  getSuggestions,
  handleKeyDown,
  handleSelectSuggestion
}) => {
  return (
    <div className="card">
      <div className="card-header">
        <Settings className="card-icon" />
        <h2 className="card-title">Settings</h2>
      </div>

      <div className="card-content">
        <div className="space-y-5">
          {!auth.token && (
            <div className="sidebar-auth-tip">
              <Lock className="tip-icon" />
              <div>
                <p className="tip-title">Private Repositories</p>
                <p className="tip-text">
                  Want to create charts for private repos? Authenticate via the <strong>Include Private Repos</strong> button in the header.
                </p>
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">Chart Mode</label>
            <div className="tabs-container">
              <button
                type="button"
                onClick={() => setChartMode('user')}
                className={`tab-btn ${chartMode === 'user' ? 'active' : ''}`}
              >
                Profile
              </button>
              <button
                type="button"
                onClick={() => setChartMode('repo')}
                className={`tab-btn ${chartMode === 'repo' ? 'active' : ''}`}
              >
                Repositories
              </button>
            </div>
          </div>

          {chartMode === 'user' && (
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                value={config.username}
                onChange={(e) => handleChange('username', e.target.value)}
                className="form-input"
                placeholder="github-username"
              />
            </div>
          )}

          {chartMode === 'repo' && (
            <RepoInputs
              repoList={repoList}
              handleRepoChange={handleRepoChange}
              handleRemoveRepo={handleRemoveRepo}
              activeInputIndex={activeInputIndex}
              setActiveInputIndex={setActiveInputIndex}
              activeSuggestionIndex={activeSuggestionIndex}
              setActiveSuggestionIndex={setActiveSuggestionIndex}
              fetchingUserRepos={fetchingUserRepos}
              getSuggestions={getSuggestions}
              handleKeyDown={handleKeyDown}
              handleSelectSuggestion={handleSelectSuggestion}
            />
          )}

          <div className="form-group">
            <label className="form-label">Duration Mode</label>
            <div className="tabs-container">
              <button
                type="button"
                onClick={() => setDurationMode('preset')}
                className={`tab-btn ${durationMode === 'preset' ? 'active' : ''}`}
              >
                Recent Months
              </button>
              <button
                type="button"
                onClick={() => setDurationMode('custom')}
                className={`tab-btn ${durationMode === 'custom' ? 'active' : ''}`}
              >
                Custom Dates
              </button>
            </div>
          </div>

          {durationMode === 'preset' ? (
            <div className="slider-group">
              <div className="slider-header">
                <label className="form-label">Duration</label>
                <span className="slider-value">{config.months} months</span>
              </div>
              <input
                type="range"
                min="1"
                max="48"
                value={config.months}
                onChange={(e) => handleChange('months', parseInt(e.target.value))}
                className="slider"
              />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                min="2008-01-01"
                max={new Date().toISOString().split('T')[0]}
                value={customRange.from}
                onChange={(e) => setCustomRange(prev => ({ ...prev, from: e.target.value }))}
                className="form-input"
              />
              <p className="slider-value" style={{ marginTop: '0.5rem', fontSize: '0.75rem', lineHeight: '1.25' }}>
                Graph will automatically run from this start date up to today (dynamic).
              </p>
            </div>
          )}

          <div className="slider-group">
            <div className="slider-header">
              <label className="form-label">Box Size</label>
              <span className="slider-value">{config.boxSize}px</span>
            </div>
            <input
              type="range"
              min="6"
              max="20"
              value={config.boxSize}
              onChange={(e) => handleChange('boxSize', parseInt(e.target.value))}
              className="slider"
            />
          </div>

          <div className="slider-group">
            <div className="slider-header">
              <label className="form-label">Spacing</label>
              <span className="slider-value">{config.boxSpacing}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              value={config.boxSpacing}
              onChange={(e) => handleChange('boxSpacing', parseInt(e.target.value))}
              className="slider"
            />
          </div>

          <div className="slider-group">
            <div className="slider-header">
              <label className="form-label">Border Radius</label>
              <span className="slider-value">{config.borderRadius}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={config.borderRadius}
              onChange={(e) => handleChange('borderRadius', parseInt(e.target.value))}
              className="slider"
            />
          </div>

          <div className="toggle-container">
            <label className="form-label">Month Labels</label>
            <button
              onClick={() => handleChange('showLabels', !config.showLabels)}
              className={`toggle-button ${config.showLabels ? 'active' : 'inactive'}`}
            >
              <span className={`toggle-thumb ${config.showLabels ? 'active' : ''}`} />
            </button>
          </div>

          <div className="toggle-container" style={{ marginTop: '0.75rem' }}>
            <div style={{ flex: 1, paddingRight: '1rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Year Labels</label>
              <p className="slider-value" style={{ fontSize: '0.6875rem', marginTop: '0.125rem', lineHeight: '1.2' }}>
                Appends compact year markers (e.g. '26) next to month names on the grid.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleChange('showYears', !config.showYears)}
              className={`toggle-button ${config.showYears ? 'active' : 'inactive'}`}
            >
              <span className={`toggle-thumb ${config.showYears ? 'active' : ''}`} />
            </button>
          </div>

          <div className="toggle-container" style={{ marginTop: '0.75rem' }}>
            <div style={{ flex: 1, paddingRight: '1rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Ignore Outliers</label>
              <p className="slider-value" style={{ fontSize: '0.6875rem', marginTop: '0.125rem', lineHeight: '1.2' }}>
                Caps the color scaling range to the 98th percentile of active days to filter anomalous peaks.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleChange('ignoreOutliers', !config.ignoreOutliers)}
              className={`toggle-button ${config.ignoreOutliers ? 'active' : 'inactive'}`}
            >
              <span className={`toggle-thumb ${config.ignoreOutliers ? 'active' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsCard;
