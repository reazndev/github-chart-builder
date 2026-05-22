import React from 'react';
import { Palette } from 'lucide-react';

const PresetsCard = ({ presets, applyPreset, isPresetSelected }) => {
  return (
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
  );
};

export default PresetsCard;
