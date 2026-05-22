import { useState, useEffect } from 'react';

export const useRepoList = (initialRepo, onRepoChange, token, username) => {
  const [repoList, setRepoList] = useState(() => {
    if (initialRepo) {
      const initialList = initialRepo.split(',').map(r => r.trim()).filter(Boolean);
      if (initialList.length < 15) {
        initialList.push('');
      }
      return initialList;
    }
    return [''];
  });
  
  const [fetchedRepos, setFetchedRepos] = useState({}); // { username: [repos] }
  const [fetchingUserRepos, setFetchingUserRepos] = useState({}); // { username: boolean }
  const [activeInputIndex, setActiveInputIndex] = useState(null);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  const fetchUserRepos = async (user) => {
    const cleanUser = user.trim().toLowerCase();
    if (!cleanUser) return;
    if (fetchedRepos[cleanUser] || fetchingUserRepos[cleanUser]) return;

    setFetchingUserRepos(prev => ({ ...prev, [cleanUser]: true }));
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || window.location.origin;
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${apiBase}/api/github-repos/${cleanUser}`, { headers });
      if (response.ok) {
        const repos = await response.json();
        setFetchedRepos(prev => ({ ...prev, [cleanUser]: repos }));
      }
    } catch (err) {
      console.error(`Failed to fetch repositories for user ${cleanUser}:`, err);
    } finally {
      setFetchingUserRepos(prev => ({ ...prev, [cleanUser]: false }));
    }
  };

  useEffect(() => {
    if (username) {
      const cleanUser = username.trim().toLowerCase();
      // Invalidate cache to fetch fresh repos (including private repos if token changed)
      setFetchedRepos(prev => {
        const copy = { ...prev };
        delete copy[cleanUser];
        return copy;
      });
      fetchUserRepos(username);
    }
  }, [username, token]);

  const handleRepoChange = (index, value) => {
    const newList = [...repoList];
    newList[index] = value;

    // Fetch repos when "owner/" is typed to trigger autocomplete
    const parts = value.split('/');
    if (parts.length > 1 && parts[0].trim() !== '') {
      const owner = parts[0].trim().toLowerCase();
      if (!fetchedRepos[owner] && !fetchingUserRepos[owner]) {
        fetchUserRepos(owner);
      }
    }

    if (index === newList.length - 1 && value.trim() !== '' && newList.length < 15) {
      newList.push('');
    }

    setRepoList(newList);
    onRepoChange(newList.map(r => r.trim()).filter(Boolean).join(','));
    setActiveSuggestionIndex(-1);
  };

  const handleRemoveRepo = (index) => {
    if (repoList.length === 1) {
      handleRepoChange(0, '');
      return;
    }
    const newList = repoList.filter((_, i) => i !== index);
    if (newList.length === 0) {
      newList.push('');
    } else if (newList[newList.length - 1].trim() !== '' && newList.length < 15) {
      newList.push('');
    }
    setRepoList(newList);
    onRepoChange(newList.map(r => r.trim()).filter(Boolean).join(','));
  };

  const handleSelectSuggestion = (index, selectedRepo) => {
    const newList = [...repoList];
    newList[index] = selectedRepo;

    if (index === newList.length - 1 && newList.length < 15) {
      newList.push('');
    }

    setRepoList(newList);
    onRepoChange(newList.map(r => r.trim()).filter(Boolean).join(','));
    setActiveInputIndex(null);
    setActiveSuggestionIndex(-1);
  };

  const getSuggestions = (value) => {
    if (!value) return [];
    const parts = value.split('/');
    const owner = parts[0].trim().toLowerCase();

    if (!owner) return [];

    const repos = fetchedRepos[owner] || [];
    return repos.filter(repoName =>
      repoName.toLowerCase().includes(value.trim().toLowerCase()) &&
      repoName.toLowerCase() !== value.trim().toLowerCase()
    ).slice(0, 5);
  };

  const handleKeyDown = (e, index, suggestions) => {
    if (suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => {
        const nextIndex = prev + 1;
        return nextIndex >= suggestions.length ? 0 : nextIndex;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => {
        const nextIndex = prev - 1;
        return nextIndex < 0 ? suggestions.length - 1 : nextIndex;
      });
    } else if (e.key === 'Enter') {
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
        e.preventDefault();
        handleSelectSuggestion(index, suggestions[activeSuggestionIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setActiveSuggestionIndex(-1);
      setActiveInputIndex(null);
    }
  };

  return {
    repoList,
    fetchedRepos,
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
  };
};
