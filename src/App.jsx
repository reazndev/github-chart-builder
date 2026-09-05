import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import About from './components/About';
import ThemeStore from './components/ThemeStore';
import PublishThemeCard from './components/PublishThemeCard';
import PreviewCard from './components/PreviewCard';
import UrlCard from './components/UrlCard';
import ColorSettingsCard from './components/ColorSettingsCard';
import SettingsCard from './components/SettingsCard';
import PresetsCard from './components/PresetsCard';
import Footer from './components/Footer';
import { PRESETS } from './constants/presets';
import { useRepoList } from './hooks/useRepoList';

const getRoute = () => {
  if (window.location.pathname === '/about') return 'about';
  if (window.location.pathname === '/themes') return 'themes';
  return 'builder';
};

const App = () => {
  const [route, setRoute] = useState(getRoute());
  const [auth, setAuth] = useState({
    token: localStorage.getItem('gh_chart_token') || '',
    username: localStorage.getItem('gh_chart_username') || ''
  });

  const [config, setConfig] = useState({
    username: localStorage.getItem('gh_chart_username') || 'reazndev',
    repo: '',
    months: 12,
    boxSize: 12,
    boxSpacing: 3,
    borderRadius: 3,
    backgroundColor: 'transparent',
    inactiveColor: '#ebedf0',
    minActivityColor: '#9be9a8',
    maxActivityColor: '#216e39',
    showLabels: true,
    showYears: false,
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
  const [chartMode, setChartMode] = useState('user'); // 'user' | 'repo'

  const handleChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const {
    repoList,
    fetchingUserRepos,
    activeInputIndex,
    setActiveInputIndex,
    activeSuggestionIndex,
    setActiveSuggestionIndex,
    handleRepoChange,
    handleRemoveRepo,
    handleSelectSuggestion,
    getSuggestions,
    handleKeyDown
  } = useRepoList(
    config.repo,
    (newRepo) => handleChange('repo', newRepo),
    auth.token,
    config.username
  );

  useEffect(() => {
    const onPopState = () => setRoute(getRoute());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (to) => {
    window.history.pushState({}, '', to);
    setRoute(getRoute());
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    document.title = route === 'about'
      ? 'About — GitHub Contributions Chart Builder'
      : route === 'themes'
        ? 'Community Themes — GitHub Contributions Chart Builder'
        : 'GitHub Contributions Chart Builder — Custom SVG for README & Portfolio';
  }, [route]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    const usernameParam = params.get('username');

    if (tokenParam && usernameParam) {
      localStorage.setItem('gh_chart_token', tokenParam);
      localStorage.setItem('gh_chart_username', usernameParam);
      
      setAuth({
        token: tokenParam,
        username: usernameParam
      });

      setConfig(prev => ({ ...prev, username: usernameParam }));

      // Reset address bar
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  const handleLogin = () => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || window.location.origin;
    window.location.href = `${apiBase}/api/auth/github`;
  };

  const handleLogout = () => {
    localStorage.removeItem('gh_chart_token');
    localStorage.removeItem('gh_chart_username');
    setAuth({ token: '', username: '' });
  };

  // Debounce config changes to avoid hitting GitHub API rate limits
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedConfig(config);
    }, 400);
    return () => clearTimeout(timer);
  }, [config]);

  useEffect(() => {
    let resolvedUsername = '';
    if (chartMode === 'user') {
      resolvedUsername = debouncedConfig.username;
    } else {
      if (debouncedConfig.repo) {
        const firstRepo = debouncedConfig.repo.split(',')[0].trim();
        if (firstRepo.includes('/')) {
          resolvedUsername = firstRepo.split('/')[0].trim();
        }
      }
    }

    if (!resolvedUsername) {
      setPreviewUrl('');
      return;
    }

    const baseParams = {
      boxSize: debouncedConfig.boxSize.toString(),
      boxSpacing: debouncedConfig.boxSpacing.toString(),
      borderRadius: debouncedConfig.borderRadius.toString(),
      backgroundColor: debouncedConfig.backgroundColor,
      inactiveColor: debouncedConfig.inactiveColor,
      minActivityColor: debouncedConfig.minActivityColor,
      maxActivityColor: debouncedConfig.maxActivityColor,
      showLabels: debouncedConfig.showLabels.toString(),
      showYears: debouncedConfig.showYears.toString(),
      labelColor: debouncedConfig.labelColor,
      ignoreOutliers: debouncedConfig.ignoreOutliers.toString()
    };

    if (durationMode === 'preset') {
      baseParams.months = debouncedConfig.months.toString();
    } else {
      baseParams.from = customRange.from;
    }

    if (chartMode === 'repo' && debouncedConfig.repo) {
      baseParams.repo = debouncedConfig.repo;
    }

    if (auth.token) {
      baseParams.token = auth.token;
    }

    const params = new URLSearchParams(baseParams);

    const apiBase = import.meta.env.VITE_API_BASE_URL || window.location.origin;
    const url = `${apiBase}/api/github-contributions/${resolvedUsername}?${params.toString()}`;
    setPreviewUrl(url);
  }, [
    debouncedConfig,
    durationMode,
    customRange.from,
    chartMode,
    auth.token
  ]);

  // AbortController prevents race conditions on rapid configuration changes
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
        if (error.name === 'AbortError') return;
        console.error('Error fetching preview SVG:', error);
        setImgStatus('error');
      });

    return () => {
      controller.abort();
    };
  }, [previewUrl]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(previewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyPreset = (preset) => {
    setConfig(prev => ({ ...prev, ...PRESETS[preset] }));
  };

  const isPresetSelected = (presetName) => {
    const preset = PRESETS[presetName];
    return (
      config.inactiveColor.toLowerCase() === preset.inactiveColor.toLowerCase() &&
      config.minActivityColor.toLowerCase() === preset.minActivityColor.toLowerCase() &&
      config.maxActivityColor.toLowerCase() === preset.maxActivityColor.toLowerCase()
    );
  };

  const applyTheme = (theme) => {
    setConfig(prev => ({
      ...prev,
      inactiveColor: theme.inactiveColor,
      minActivityColor: theme.minActivityColor,
      maxActivityColor: theme.maxActivityColor
    }));
    navigate('/');
  };

  const hasInput = chartMode === 'user'
    ? !!config.username
    : !!config.repo && config.repo.split(',')[0].trim().includes('/');

  return (
    <div className="app">
      <Header
        auth={auth}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        route={route}
        navigate={navigate}
      />

      <main className="main-container">
        {route === 'about' ? (
          <About onBack={() => navigate('/')} />
        ) : route === 'themes' ? (
          <ThemeStore onApply={applyTheme} />
        ) : (
        <div className="grid">
          <div className="space-y-6">
            <PreviewCard
              hasInput={hasInput}
              imgStatus={imgStatus}
              svgContent={svgContent}
              chartMode={chartMode}
            />

            <UrlCard
              previewUrl={previewUrl}
              copyToClipboard={copyToClipboard}
              copied={copied}
            />

            <ColorSettingsCard
              config={config}
              handleChange={handleChange}
            />

            <PublishThemeCard config={config} navigate={navigate} />
          </div>

          <div className="space-y-6">
            <SettingsCard
              auth={auth}
              config={config}
              handleChange={handleChange}
              chartMode={chartMode}
              setChartMode={setChartMode}
              durationMode={durationMode}
              setDurationMode={setDurationMode}
              customRange={customRange}
              setCustomRange={setCustomRange}
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

            <PresetsCard
              presets={PRESETS}
              applyPreset={applyPreset}
              isPresetSelected={isPresetSelected}
              navigate={navigate}
            />
          </div>
        </div>
        )}
      </main>

      <Footer navigate={navigate} />
    </div>
  );
};

export default App;
