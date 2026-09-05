import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const PARAMS = [
  ['username', 'GitHub login in the path', '/api/github-contributions/reazndev'],
  ['repo', 'Comma-separated owner/repo or bare names', '?repo=facebook/react'],
  ['months (1–48)', 'Preset range, overrides from/to', '?months=12'],
  ['from / to', 'Custom range (YYYY-MM-DD), to defaults to today', '?from=2024-01-01'],
  ['boxSize / boxSpacing / borderRadius', 'Cell sizing in px', '12 / 3 / 3'],
  ['backgroundColor / inactiveColor / minActivityColor / maxActivityColor', 'Hex or transparent', '#ebedf0 …'],
  ['labelColor / showLabels / showYears', 'Month + year markers', 'true / false'],
  ['ignoreOutliers', 'Clip color scale to 98th percentile', 'false'],
  ['token', 'Encrypted OAuth payload for private repos. Never share publicly.', '—'],
];

const AGENT_SETUP = `Read and follow https://gh.ruu.by/agents.md`;

const About = ({ onBack }) => {
  const [copiedSetup, setCopiedSetup] = useState(false);

  const copyAgentSetup = async () => {
    try {
      await navigator.clipboard.writeText(AGENT_SETUP);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = AGENT_SETUP;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedSetup(true);
    setTimeout(() => setCopiedSetup(false), 2000);
  };

  return (
    <div className="about-stack">
      <section className="card" aria-labelledby="about-what">
        <div className="card-header">
          <h2 className="card-title" id="about-what">What it does</h2>
        </div>
        <div className="card-content">
          <p className="about-text">
            GitHub Chart Builder turns any GitHub contribution history into an embeddable SVG.
            Pick colors and range in the builder, copy the URL, paste it as an image in your README or portfolio.
          </p>
        </div>
      </section>

      <section className="card" aria-labelledby="about-embed">
        <div className="card-header">
          <h2 className="card-title" id="about-embed">How to embed</h2>
        </div>
        <div className="card-content">
          <div className="url-display">![contributions](https://gh.ruu.by/api/github-contributions/YOU?months=12)</div>
          <ol className="about-list">
            <li>Build your chart on the <button type="button" className="inline-link link-btn" onClick={onBack}>builder</button>.</li>
            <li>Copy the generated URL.</li>
            <li>Paste it as a Markdown image in your README.</li>
          </ol>
        </div>
      </section>

      <section className="card" aria-labelledby="about-params">
        <div className="card-header">
          <h2 className="card-title" id="about-params">API params</h2>
        </div>
        <div className="card-content" style={{ overflowX: 'auto' }}>
          <table className="about-table">
            <thead>
              <tr><th scope="col">Param</th><th scope="col">Meaning</th><th scope="col">Example</th></tr>
            </thead>
            <tbody>
              {PARAMS.map(([k, v, ex]) => (
                <tr key={k}>
                  <td><code>{k}</code></td>
                  <td>{v}</td>
                  <td><code>{ex}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" aria-labelledby="about-privacy">
        <div className="card-header">
          <h2 className="card-title" id="about-privacy">Privacy</h2>
        </div>
        <div className="card-content">
          <p className="about-text">
            <strong>How it works.</strong> Clicking “Include Private Repos” starts a GitHub OAuth login.
            GitHub sends a one-time code to this server, the server exchanges it for an access token
            (the secret never touches your browser), encrypts it with AES-256-GCM, and returns it as{' '}
            <code>?token=&lt;encrypted&gt;</code>. The app stores that blob in localStorage and attaches
            it to API requests so the server can count your private activity.
          </p>
          <p className="about-text">
            <strong>If a bad actor gets your link with <code>?token=</code>, they can craft custom links:</strong>
          </p>
          <ul className="about-list">
            <li><code>/api/github-repos/YOU?token=THEIRS</code> — dump up to 100 of your repo names, including private ones, and watch for new ones over time.</li>
            <li><code>/api/github-contributions/YOU?repo=owner/private-repo&token=THEIRS</code> — isolate a single private repo and chart exactly when and how intensely you worked on it.</li>
            <li><code>/api/github-contributions/YOU?from=2024-01-01&to=2024-12-31&token=THEIRS</code> — slice any date range to reconstruct vacations, launches, or client work patterns.</li>
            <li>Embed any of the above as an <code>&lt;img&gt;</code> on their own site — the blob works cross-origin, needs no login, and never expires on its own.</li>
          </ul>
          <p className="about-text">
            <strong>They cannot:</strong>
          </p>
          <ul className="about-list">
            <li>Recover your raw GitHub token — it stays AES-encrypted and only this server can decrypt it.</li>
            <li>Read source code, file contents, diffs, or filenames — this API only exposes repo names and per-day counts.</li>
            <li>Use the blob directly against <code>api.github.com</code> (GitHub rejects it), push code, or change anything on your account.</li>
          </ul>
        </div>
      </section>

      <button type="button" className="agent-setup-fab" onClick={copyAgentSetup} aria-live="polite">
        {copiedSetup ? <Check className="btn-icon" aria-hidden="true" /> : <Copy className="btn-icon" aria-hidden="true" />}
        {copiedSetup ? 'Copied' : 'Copy agent setup'}
      </button>
    </div>
  );
};

export default About;
