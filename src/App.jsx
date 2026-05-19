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
    labelColor: '#24292f'
  });

  const [previewUrl, setPreviewUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams({
      months: config.months.toString(),
      boxSize: config.boxSize.toString(),
      boxSpacing: config.boxSpacing.toString(),
      borderRadius: config.borderRadius.toString(),
      // pass raw values and let URLSearchParams handle encoding
      backgroundColor: config.backgroundColor,
      inactiveColor: config.inactiveColor,
      minActivityColor: config.minActivityColor,
      maxActivityColor: config.maxActivityColor,
      showLabels: config.showLabels.toString(),
      labelColor: config.labelColor
    });

    // Support static deployments (using a separate backend URL via env)
    // or unified VPS deployments (defaults to relative origin).
    const apiBase = import.meta.env.VITE_API_BASE_URL || window.location.origin;
    const url = `${apiBase}/api/github-contributions/${config.username}?${params.toString()}`;
    setPreviewUrl(url);
  }, [config]);

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
                    <img
                      src={previewUrl}
                      alt="GitHub Contributions Chart"
                      className="preview-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : (
                    <p className="preview-placeholder">Enter a username to preview</p>
                  )}
                  <p className="preview-error">Unable to load chart</p>
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

                  <div className="slider-group">
                    <div className="slider-header">
                      <label className="form-label">Duration</label>
                      <span className="slider-value">{config.months} months</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="12"
                      value={config.months}
                      onChange={(e) => handleChange('months', parseInt(e.target.value))}
                      className="slider"
                    />
                  </div>

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
