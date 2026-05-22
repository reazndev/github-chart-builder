import React from 'react';

const RepoInputs = ({
  repoList,
  handleRepoChange,
  handleRemoveRepo,
  activeInputIndex,
  setActiveInputIndex,
  activeSuggestionIndex,
  setActiveSuggestionIndex,
  fetchingUserRepos,
  getSuggestions,
  handleKeyDown,
  handleSelectSuggestion
}) => {
  return (
    <div className="form-group">
      <label className="form-label">Repositories (max 15, format: owner/repo)</label>
      <div className="space-y-2">
        {repoList.map((repo, index) => {
          const suggestions = getSuggestions(repo);
          const parts = repo.split('/');
          const owner = parts[0].trim().toLowerCase();
          const isFetching = fetchingUserRepos[owner];

          return (
            <div key={index} className="repo-input-wrapper">
              <input
                type="text"
                value={repo}
                onChange={(e) => handleRepoChange(index, e.target.value)}
                onFocus={() => {
                  setActiveInputIndex(index);
                  setActiveSuggestionIndex(-1);
                }}
                onKeyDown={(e) => handleKeyDown(e, index, suggestions)}
                onBlur={() => {
                  // Blur timeout is needed to allow clicks on dropdown to register
                  setTimeout(() => {
                    setActiveInputIndex(null);
                    setActiveSuggestionIndex(-1);
                  }, 200);
                }}
                className="form-input"
                placeholder={`Repository ${index + 1} (e.g. facebook/react)`}
                style={{ flex: 1 }}
              />

              {repoList.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveRepo(index)}
                  className="repo-remove-btn"
                  title="Remove repository"
                >
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}

              {activeInputIndex === index && (suggestions.length > 0 || isFetching) && (
                <div className="autocomplete-dropdown">
                  {isFetching && (
                    <div className="autocomplete-item loading">Fetching repositories...</div>
                  )}
                  {!isFetching && suggestions.map((suggestion, sIndex) => (
                    <div
                      key={suggestion}
                      onMouseDown={() => handleSelectSuggestion(index, suggestion)}
                      className={`autocomplete-item ${sIndex === activeSuggestionIndex ? 'highlighted' : ''}`}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="slider-value" style={{ marginTop: '0.5rem', fontSize: '0.6875rem', lineHeight: '1.2' }}>
        Start typing a repository name. Once you type a user prefix and a slash (e.g. <strong>reazndev/</strong>), available public repositories will autocomplete below. Filling one field will dynamically open another.
      </p>
    </div>
  );
};

export default RepoInputs;
