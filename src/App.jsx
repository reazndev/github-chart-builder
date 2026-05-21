import React, { useState, useEffect } from 'react';
import { Copy, Github, Palette, Settings, Check } from 'lucide-react';
import './App.css';

const App = () => {
  const [config, setConfig] = useState({
    username: 'reazndev',
    months: 12,
    boxSize: 12,
    boxSpacing: 3,
    borderRadius: 3,
    backgroundColor: 'transparent',
    inactiveColor: '#ececf0',
    minActivityColor: '#e8cb38',
    maxActivityColor: '#5649cc',
    showLabels: true,
    labelColor: '#24292f',
    ignoreOutliers: false
  });

  const [previewUrl, setPreviewUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [debouncedConfig, setDebouncedConfig] = useState(config);
  const [imgStatus, setImgStatus] = useState('loading'); // 'loading' | 'success' | 'error' | 'idle'
  const [durationMode, setDurationMode] = useState('preset'); // 'preset' | 'custom'
  const [customRange, setCustomRange] = useState({
    from: '2023-01-01'
  });
  const [svgContent, setSvgContent] = useState('');

  // Debounce the entire config to prevent spamming the GitHub GraphQL API during rapid typing/clicking/dragging
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedConfig(config);
    }, 400);
    return () => clearTimeout(timer);
  }, [config]);

  // Update preview URL when debounced config, durationMode, or customRange changes
  useEffect(() => {
    if (!debouncedConfig.username) return;

    const baseParams = {
      boxSize: debouncedConfig.boxSize.toString(),
      boxSpacing: debouncedConfig.boxSpacing.toString(),
      borderRadius: debouncedConfig.borderRadius.toString(),
      backgroundColor: debouncedConfig.backgroundColor,
      inactiveColor: debouncedConfig.inactiveColor,
      minActivityColor: debouncedConfig.minActivityColor,
      maxActivityColor: debouncedConfig.maxActivityColor,
      showLabels: debouncedConfig.showLabels.toString(),
      labelColor: debouncedConfig.labelColor,
      ignoreOutliers: debouncedConfig.ignoreOutliers.toString()
    };

    if (durationMode === 'preset') {
      baseParams.months = debouncedConfig.months.toString();
    } else {
      baseParams.from = customRange.from;
    }

    const params = new URLSearchParams(baseParams);

    const apiBase = import.meta.env.VITE_API_BASE_URL || window.location.origin;
    const url = `${apiBase}/api/github-contributions/${debouncedConfig.username}?${params.toString()}`;
    setPreviewUrl(url);
  }, [
    debouncedConfig,
    durationMode,
    customRange.from
  ]);

  // Fetch SVG content reactively, utilizing AbortController to cleanly cancel previous/stacked requests
  useEffect(() => {
    if (!previewUrl) {
      setImgStatus('idle');
      setSvgContent('');
      return;
    }

    setImgStatus('loading');
    const controller = new AbortController();

    fetch(previewUrl, { signal: controller.signal })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch contributions');
        }
        // Handle API JSON error responses gracefully
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return response.json().then(err => {
            throw new Error(err.details || err.error || 'Failed to fetch contributions');
          });
        }
        return response.text();
      })
      .then(svgText => {
        setSvgContent(svgText);
        setImgStatus('success');
      })
      .catch(error => {
        if (error.name === 'AbortError') {
          // Ignore aborted request
          return;
        }
        console.error('Error fetching preview SVG:', error);
        setImgStatus('error');
      });

    return () => {
      controller.abort();
    };
  }, [previewUrl]);

  const handleChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(previewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presets = {
    github: {
      inactiveColor: '#ebedf0',
      minActivityColor: '#9be9a8',
      maxActivityColor: '#216e39'
    },
    sunset: {
      inactiveColor: '#ffe5e5',
      minActivityColor: '#ff9a76',
      maxActivityColor: '#d62828'
    },
    ocean: {
      inactiveColor: '#e0f2fe',
      minActivityColor: '#7dd3fc',
      maxActivityColor: '#0369a1'
    },
    purple: {
      inactiveColor: '#ececf0',
      minActivityColor: '#e8cb38',
      maxActivityColor: '#5649cc'
    },
    midnight: {
      inactiveColor: '#1a1f2e',
      minActivityColor: '#4a5568',
      maxActivityColor: '#3b82f6'
    },
    candy: {
      inactiveColor: '#fce4ec',
      minActivityColor: '#f06292',
      maxActivityColor: '#ad1457'
    },
    monochrome: {
      inactiveColor: '#f5f5f5',
      minActivityColor: '#9e9e9e',
      maxActivityColor: '#212121'
    },
    amber: {
      inactiveColor: '#fff8e1',
      minActivityColor: '#ffb300',
      maxActivityColor: '#e65100'
    },
    catppuccin: {
      inactiveColor: '#313244',
      minActivityColor: '#a6e3a1',
      maxActivityColor: '#cba6f7'
    },
    dracula: {
      inactiveColor: '#282a36',
      minActivityColor: '#8be9fd',
      maxActivityColor: '#bd93f9'
    },
    nord: {
      inactiveColor: '#2e3440',
      minActivityColor: '#8fbcbb',
      maxActivityColor: '#88c0d0'
    },
    gruvbox: {
      inactiveColor: '#282828',
      minActivityColor: '#b8bb26',
      maxActivityColor: '#fe8019'
    },
    'tokyo night': {
      inactiveColor: '#16161e',
      minActivityColor: '#7aa2f7',
      maxActivityColor: '#bb9af3'
    }
  };

  const applyPreset = (preset) => {
    setConfig(prev => ({ ...prev, ...presets[preset] }));
  };

  const isPresetSelected = (presetName) => {
    const preset = presets[presetName];
    return (
      config.inactiveColor.toLowerCase() === preset.inactiveColor.toLowerCase() &&
      config.minActivityColor.toLowerCase() === preset.minActivityColor.toLowerCase() &&
      config.maxActivityColor.toLowerCase() === preset.maxActivityColor.toLowerCase()
    );
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="header-title-section">
            <Github className="header-icon" />
            <div>
              <h1 className="header-title">Contributions Chart Builder</h1>
              <p className="header-subtitle">Customize your GitHub contribution graph</p>
            </div>
          </div>
        </div>
      </header>

      <div className="main-container">
        <div className="grid">
          {/* Preview Section */}
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Preview</h2>
              </div>
              <div className="card-content">
                <div className="preview-container">
                  {config.username ? (
                    <>
                      {imgStatus === 'loading' && (
                        <div className="preview-loading">
                          <div className="spinner"></div>
                          <p>Fetching contributions...</p>
                        </div>
                      )}
                      {imgStatus === 'error' && (
                        <div className="preview-error">
                          Unable to load contributions chart. Please check the username or try again later.
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
                    <p className="preview-placeholder">Enter a username to preview</p>
                  )}
                </div>
              </div>
            </div>

            {/* Generated URL */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Generated URL</h2>
              </div>
              <div className="card-content">
                <div className="url-container">
                  <div className="url-display">
                    {previewUrl}
                  </div>
                  <button onClick={copyToClipboard} className="copy-url-btn">
                    {copied ? <Check className="btn-icon" /> : <Copy className="btn-icon" />}
                    {copied ? 'Copied' : 'Copy URL'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="space-y-6">
            {/* Basic Settings */}
            <div className="card">
              <div className="card-header">
                <Settings className="card-icon" />
                <h2 className="card-title">Settings</h2>
              </div>

              <div className="card-content">
                <div className="space-y-5">
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

            {/* Color Presets */}
            <div className="card">
              <div className="card-header">
                <Palette className="card-icon" />
                <h2 className="card-title">Presets</h2>
              </div>

              <div className="card-content">
                <div className="preset-grid">
                  {Object.keys(presets).map(preset => (
                    <button
                      key={preset}
                      onClick={() => applyPreset(preset)}
                      className={`preset-button ${isPresetSelected(preset) ? 'active' : ''}`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Color Settings */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Colors</h2>
              </div>

              <div className="card-content">
                <div className="space-y-4">

                  <div className="color-grid">
                    <div>
                      <label className="form-label">Inactive</label>
                      <input
                        type="color"
                        value={config.inactiveColor}
                        onChange={(e) => handleChange('inactiveColor', e.target.value)}
                        className="color-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">Min Activity</label>
                      <input
                        type="color"
                        value={config.minActivityColor}
                        onChange={(e) => handleChange('minActivityColor', e.target.value)}
                        className="color-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">Max Activity</label>
                      <input
                        type="color"
                        value={config.maxActivityColor}
                        onChange={(e) => handleChange('maxActivityColor', e.target.value)}
                        className="color-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">Labels</label>
                      <input
                        type="color"
                        value={config.labelColor}
                        onChange={(e) => handleChange('labelColor', e.target.value)}
                        className="color-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="site-footer">
        <div className="footer-container">
          <p className="footer-text">
            Built by <a href="https://github.com/reazndev" target="_blank" rel="noopener noreferrer" className="footer-link">@reazndev</a>
            {' • '}
            <a href="https://github.com/reazndev/github-chart-builder" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub Repo</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
