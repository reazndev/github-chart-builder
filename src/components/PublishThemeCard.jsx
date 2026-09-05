import React, { useState } from 'react';
import { getClientId } from '../utils/clientId';
import { autoThemeName } from '../utils/themeNamer';

const PublishThemeCard = ({ config, navigate }) => {
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const publish = async () => {
    if (busy) return;
    setBusy(true);
    setNotice('');
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || window.location.origin;
      const base = await autoThemeName({
        inactiveColor: config.inactiveColor,
        minActivityColor: config.minActivityColor,
        maxActivityColor: config.maxActivityColor
      });

      // Name after the signature color; suffix on collision (server 409s duplicates)
      for (let attempt = 0; attempt < 5; attempt++) {
        const name = attempt === 0 ? base : `${base} ${attempt + 1}`.slice(0, 28);
        const res = await fetch(`${apiBase}/api/themes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            inactiveColor: config.inactiveColor,
            minActivityColor: config.minActivityColor,
            maxActivityColor: config.maxActivityColor,
            clientId: getClientId()
          })
        });
        if (res.ok) {
          const data = await res.json();
          setNotice(`Published “${data.name}”. View it in the Themes store.`);
          return;
        }
        const data = await res.json().catch(() => ({}));
        if (res.status !== 409) throw new Error(data.error || 'Publish failed');
      }
      throw new Error('That color combo is taken — tweak a color and try again.');
    } catch (err) {
      setNotice(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card" aria-labelledby="publish-title">
      <div className="card-header">
        <h2 className="card-title" id="publish-title">Share theme</h2>
      </div>
      <div className="card-content">
        <p className="about-text" style={{ marginBottom: '1rem' }}>
          Publish your current colors to the{' '}
          <button type="button" className="inline-link link-btn" onClick={() => navigate('/themes')}>
            Themes store
          </button>
          . It gets auto-named after its colors.
        </p>
        <button type="button" className="btn btn-primary" onClick={publish} disabled={busy}>
          {busy ? 'Publishing…' : 'Publish theme'}
        </button>
        {notice && <p className="slider-value" role="status" style={{ marginTop: '0.75rem' }}>{notice}</p>}
      </div>
    </section>
  );
};

export default PublishThemeCard;
