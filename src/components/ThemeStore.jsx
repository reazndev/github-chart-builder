import React, { useEffect, useState } from 'react';

// Deterministic sample activity so every theme previews the same shape
function sampleLevel(week, day) {
  return (week * 7 + day * 13) % 5; // 0..4, 0 = inactive
}

function mix(hexA, hexB, t) {
  const a = [1, 3, 5].map(i => parseInt(hexA.slice(i, i + 2), 16));
  const b = [1, 3, 5].map(i => parseInt(hexB.slice(i, i + 2), 16));
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

function ThemePreview({ theme }) {
  const box = 12;
  const gap = 4;
  const weeks = 26;
  const cells = [];
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const level = sampleLevel(w, d);
      const fill = level === 0
        ? theme.inactiveColor
        : mix(theme.minActivityColor, theme.maxActivityColor, (level - 1) / 3);
      cells.push(
        <rect
          key={`${w}-${d}`}
          x={w * (box + gap)}
          y={d * (box + gap)}
          width={box}
          height={box}
          rx={3}
          fill={fill}
        />
      );
    }
  }
  return (
    <svg
      width={weeks * (box + gap)}
      height={7 * (box + gap)}
      viewBox={`0 0 ${weeks * (box + gap)} ${7 * (box + gap)}`}
      role="img"
      aria-label={`${theme.name} theme preview`}
    >
      {cells}
    </svg>
  );
}

const ThemeStore = ({ onApply }) => {
  const [themes, setThemes] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error

  const apiBase = import.meta.env.VITE_API_BASE_URL || window.location.origin;

  const load = async () => {
    try {
      const res = await fetch(`${apiBase}/api/themes`);
      if (!res.ok) throw new Error('load failed');
      setThemes(await res.json());
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="theme-grid">
      {status === 'loading' && (
        <div className="card" style={{ gridColumn: '1 / -1' }}><div className="card-content"><p className="about-text">Loading themes…</p></div></div>
      )}
      {status === 'error' && (
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-content">
            <p className="about-text">
              Could not load themes. <button type="button" className="inline-link link-btn" onClick={load}>Retry</button>
            </p>
          </div>
        </div>
      )}
      {status === 'ready' && themes.length === 0 && (
        <div className="card" style={{ gridColumn: '1 / -1' }}><div className="card-content"><p className="about-text">No community themes yet — yours could be the first.</p></div></div>
      )}
      {themes.map(t => (
        <article key={t.id} className="card" aria-label={`${t.name} theme`}>
          <div className="card-header theme-header">
            <h2 className="card-title">{t.name}</h2>
            <button type="button" className="btn btn-secondary theme-apply-btn" onClick={() => onApply(t)}>
              Use
            </button>
          </div>
          <div className="card-content">
            <div className="theme-preview">
              <ThemePreview theme={t} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default ThemeStore;
