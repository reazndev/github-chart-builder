import React from 'react';
import { Palette } from 'lucide-react';

const PresetsCard = ({ presets, applyPreset, isPresetSelected, navigate }) => {
  return (
    <section className="card" aria-labelledby="presets-title">
      <div className="card-header">
        <Palette className="card-icon" aria-hidden="true" />
        <h2 className="card-title" id="presets-title">Presets</h2>
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
        <p className="about-text" style={{ marginTop: '1rem' }}>
          Find community-made templates{' '}
          <button type="button" className="inline-link link-btn" onClick={() => navigate('/themes')}>
            here
          </button>
          .
        </p>
      </div>
    </section>
  );
};

export default PresetsCard;
