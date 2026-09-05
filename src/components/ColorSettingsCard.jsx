import React from 'react';

const ColorSettingsCard = ({ config, handleChange }) => {
  return (
    <section className="card" aria-labelledby="colors-title">
      <div className="card-header">
        <h2 className="card-title" id="colors-title">Colors</h2>
      </div>
      <div className="card-content">
        <div className="space-y-4">
          <div className="color-grid">
            <div>
              <label className="form-label" htmlFor="color-inactive">Inactive</label>
              <input
                id="color-inactive"
                aria-label="Inactive day color"
                type="color"
                value={config.inactiveColor}
                onChange={(e) => handleChange('inactiveColor', e.target.value)}
                className="color-input"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="color-min">Min Activity</label>
              <input
                id="color-min"
                aria-label="Minimum activity color"
                type="color"
                value={config.minActivityColor}
                onChange={(e) => handleChange('minActivityColor', e.target.value)}
                className="color-input"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="color-max">Max Activity</label>
              <input
                id="color-max"
                aria-label="Maximum activity color"
                type="color"
                value={config.maxActivityColor}
                onChange={(e) => handleChange('maxActivityColor', e.target.value)}
                className="color-input"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="color-labels">Labels</label>
              <input
                id="color-labels"
                aria-label="Label color"
                type="color"
                value={config.labelColor}
                onChange={(e) => handleChange('labelColor', e.target.value)}
                className="color-input"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ColorSettingsCard;
