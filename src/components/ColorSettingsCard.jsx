import React from 'react';

const ColorSettingsCard = ({ config, handleChange }) => {
  return (
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
  );
};

export default ColorSettingsCard;
