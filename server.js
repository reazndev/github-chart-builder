import express from 'express';
import axios from 'axios';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8030;

// Configure CORS
app.use(cors({
    origin: '*', // Allow all origins for the builder tool API so anybody can embed the charts
    methods: ['GET'],
    credentials: true
}));

app.use(express.json());

// Check if GITHUB_TOKEN is available, print a warning if missing instead of exiting
// (This enables the server to start and serve the frontend even without a token, or show nice API errors)
if (!process.env.GITHUB_TOKEN) {
  console.warn('Warning: GITHUB_TOKEN is not set in .env file. API queries will fail.');
}

const DEFAULT_COLORS = {
  background: '#ffffff',
  border: '#ebedf0',
  inactive: '#ebedf0',
  minActivity: '#9be9a8',
  maxActivity: '#216e39'
};

function splitDateRange(fromStr, toStr) {
  const chunks = [];
  const overallFrom = new Date(fromStr);
  const overallTo = new Date(toStr);
  
  let currentFrom = new Date(overallFrom);
  
  while (currentFrom < overallTo) {
    let currentTo = new Date(currentFrom);
    currentTo.setUTCDate(currentTo.getUTCDate() + 364); // 364 days is exactly 52 weeks
    
    // Set to the end of the day
    currentTo.setUTCHours(23, 59, 59, 999);
    
    if (currentTo > overallTo) {
      currentTo = new Date(overallTo);
    }
    
    chunks.push({
      from: currentFrom.toISOString(),
      to: currentTo.toISOString()
    });
    
    const nextFrom = new Date(currentTo);
    nextFrom.setUTCDate(nextFrom.getUTCDate() + 1);
    nextFrom.setUTCHours(0, 0, 0, 0);
    currentFrom = nextFrom;
  }
  
  return chunks;
}

async function fetchContributions(username, from, to, repo = null) {
  const chunks = splitDateRange(from, to);
  
  const calendarQuery = `
    query($username: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

  const repoQuery = `
    query($username: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $from, to: $to) {
          commitContributionsByRepository(maxRepositories: 100) {
            repository {
              nameWithOwner
            }
            contributions(first: 100) {
              nodes {
                occurredAt
                commitCount
              }
            }
          }
          issueContributionsByRepository(maxRepositories: 100) {
            repository {
              nameWithOwner
            }
            contributions(first: 100) {
              nodes {
                occurredAt
              }
            }
          }
          pullRequestContributionsByRepository(maxRepositories: 100) {
            repository {
              nameWithOwner
            }
            contributions(first: 100) {
              nodes {
                occurredAt
              }
            }
          }
          pullRequestReviewContributionsByRepository(maxRepositories: 100) {
            repository {
              nameWithOwner
            }
            contributions(first: 100) {
              nodes {
                occurredAt
              }
            }
          }
        }
      }
    }
  `;

  const query = repo ? repoQuery : calendarQuery;

  if (!process.env.GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN environment variable is not configured on the server.');
  }

  // Fetch all chunks in parallel
  const results = await Promise.all(chunks.map(async (chunk) => {
    try {
      const response = await axios.post('https://api.github.com/graphql', {
        query,
        variables: { username, from: chunk.from, to: chunk.to }
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000
      });

      if (response.data.errors) {
        throw new Error(response.data.errors.map(e => e.message).join(', '));
      }

      if (!response.data.data || !response.data.data.user) {
        throw new Error(`User '${username}' not found on GitHub.`);
      }

      return response.data.data.user.contributionsCollection;
    } catch (error) {
      console.error(`Error fetching chunk ${chunk.from} to ${chunk.to}:`, error.message);
      throw error;
    }
  }));

  // Merge the calendar results
  const daysMap = new Map();
  let totalContributions = 0;

  if (repo) {
    // Support multiple comma-separated repositories (e.g. "react, facebook/react")
    const targetRepos = repo.split(',').map(r => {
      const trimmed = r.trim();
      return trimmed.includes('/') ? trimmed.toLowerCase() : `${username}/${trimmed}`.toLowerCase();
    });

    results.forEach(collection => {
      if (!collection) return;

      const processRepoNodes = (repoList, isCommit = false) => {
        if (!repoList) return;
        repoList.forEach(item => {
          if (item.repository && targetRepos.includes(item.repository.nameWithOwner.toLowerCase())) {
            if (item.contributions && item.contributions.nodes) {
              item.contributions.nodes.forEach(node => {
                const dateStr = node.occurredAt.split('T')[0];
                const count = isCommit ? (node.commitCount || 1) : 1;
                daysMap.set(dateStr, (daysMap.get(dateStr) || 0) + count);
                totalContributions += count;
              });
            }
          }
        });
      };

      processRepoNodes(collection.commitContributionsByRepository, true);
      processRepoNodes(collection.issueContributionsByRepository);
      processRepoNodes(collection.pullRequestContributionsByRepository);
      processRepoNodes(collection.pullRequestReviewContributionsByRepository);
    });
  } else {
    results.forEach(collection => {
      const calendar = collection ? collection.contributionCalendar : null;
      if (calendar && calendar.weeks) {
        calendar.weeks.forEach(week => {
          if (week.contributionDays) {
            week.contributionDays.forEach(day => {
              if (!daysMap.has(day.date)) {
                daysMap.set(day.date, day.contributionCount);
                totalContributions += day.contributionCount;
              }
            });
          }
        });
      }
    });
  }

  // Reconstruct weeks array spanning from the Sunday before 'from' to the Saturday after 'to'
  const start = new Date(from);
  const startDay = start.getUTCDay();
  start.setUTCDate(start.getUTCDate() - startDay);

  const end = new Date(to);
  const endDay = end.getUTCDay();
  end.setUTCDate(end.getUTCDate() + (6 - endDay));

  const weeks = [];
  let currentWeekDays = [];

  let current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    const contributionCount = daysMap.has(dateStr) ? daysMap.get(dateStr) : 0;

    currentWeekDays.push({
      date: dateStr,
      contributionCount
    });

    if (currentWeekDays.length === 7) {
      weeks.push({ contributionDays: currentWeekDays });
      currentWeekDays = [];
    }

    current.setUTCDate(current.getUTCDate() + 1);
  }

  return {
    totalContributions,
    weeks
  };
}

function interpolateColor(color1, color2, factor) {
  // Handle 'transparent' or invalid colors gracefully by using defaults if they fail parsing
  const parseHex = (color, defaultHex) => {
    if (!color || color === 'transparent' || !color.startsWith('#')) {
      return defaultHex;
    }
    return color;
  };

  const c1 = parseHex(color1, '#ebedf0');
  const c2 = parseHex(color2, '#216e39');

  const r1 = parseInt(c1.substring(1, 3), 16);
  const g1 = parseInt(c1.substring(3, 5), 16);
  const b1 = parseInt(c1.substring(5, 7), 16);
  
  const r2 = parseInt(c2.substring(1, 3), 16);
  const g2 = parseInt(c2.substring(3, 5), 16);
  const b2 = parseInt(c2.substring(5, 7), 16);
  
  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function generateColorGradient(minColor, maxColor, steps) {
  const colors = [];
  for (let i = 0; i < steps; i++) {
    colors.push(interpolateColor(minColor, maxColor, i / (steps - 1)));
  }
  return colors;
}

function getMonthLabel(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[new Date(date).getMonth()];
}

function generateSVG(contributions, options = {}) {
  if (!contributions || !contributions.weeks || !Array.isArray(contributions.weeks)) {
    throw new Error('Invalid contributions data');
  }

  const {
    boxSize = 10,
    boxSpacing = 2,
    borderRadius = 2,
    backgroundColor = DEFAULT_COLORS.background,
    borderColor = DEFAULT_COLORS.border,
    inactiveColor = DEFAULT_COLORS.inactive,
    minActivityColor = DEFAULT_COLORS.minActivity,
    maxActivityColor = DEFAULT_COLORS.maxActivity,
    showLabels = true,
    showYears = false,
    labelColor = '#24292f',
    ignoreOutliers = false
  } = options;

  // Ensure all numeric values are valid
  const validBoxSize = Math.max(1, Number(boxSize) || 10);
  const validBoxSpacing = Math.max(0, Number(boxSpacing) || 2);
  const validBorderRadius = Math.max(0, Number(borderRadius) || 2);

  const weeks = contributions.weeks;
  const boxWidth = validBoxSize;
  const boxHeight = validBoxSize;
  const labelHeight = showLabels ? 20 : 0; // Height for month labels
  const width = (boxWidth + validBoxSpacing) * weeks.length;
  const height = (boxHeight + validBoxSpacing) * 7 + labelHeight;

  // Find the maximum contribution count (optionally ignoring high outliers using the 98th percentile)
  let maxCount = 0;
  if (ignoreOutliers) {
    const activeCounts = [];
    weeks.forEach(week => {
      week.contributionDays.forEach(day => {
        if (day.contributionCount > 0) {
          activeCounts.push(day.contributionCount);
        }
      });
    });

    if (activeCounts.length > 0) {
      activeCounts.sort((a, b) => a - b);
      // Use the 98th percentile of active days to clip top 2% outliers
      const percentileIndex = Math.floor(activeCounts.length * 0.98);
      maxCount = activeCounts[percentileIndex] || 1;
    } else {
      maxCount = 1;
    }
  } else {
    weeks.forEach(week => {
      week.contributionDays.forEach(day => {
        maxCount = Math.max(maxCount, day.contributionCount);
      });
    });
  }

  // Generate color gradient
  const activityColors = generateColorGradient(minActivityColor, maxActivityColor, 4);
  
  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" 
             xmlns="http://www.w3.org/2000/svg" style="background-color: ${backgroundColor}">`;

  // Add month labels if enabled
  if (showLabels) {
    let currentMonth = '';
    let currentYear = '';
    let monthStartX = 0;
    let monthLabelWidth = 0;
    
    weeks.forEach((week, weekIndex) => {
      if (week.contributionDays && week.contributionDays.length > 0) {
        const firstDayOfWeek = week.contributionDays[0].date;
        const month = getMonthLabel(firstDayOfWeek);
        const year = new Date(firstDayOfWeek).getFullYear().toString();
        
        if (month !== currentMonth) {
          // If it's a new month, add the label
          if (monthLabelWidth > 0) {
            // Add the previous month label centered over its weeks
            const labelX = monthStartX + (monthLabelWidth - 30) / 2; // 30 is approximate text width
            const labelText = (showYears && currentMonth === 'Jan') 
              ? `${currentMonth} '${currentYear.substring(2)}` 
              : currentMonth;
            svg += `<text x="${labelX}" y="15" font-family="Arial" font-size="12" fill="${labelColor}">${labelText}</text>`;
          }
          currentMonth = month;
          currentYear = year;
          monthStartX = weekIndex * (boxWidth + validBoxSpacing);
          monthLabelWidth = 0;
        }
        monthLabelWidth += (boxWidth + validBoxSpacing);
      }
    });
    
    // Add the last month label
    if (monthLabelWidth > 0) {
      const labelX = monthStartX + (monthLabelWidth - 30) / 2;
      const labelText = (showYears && currentMonth === 'Jan') 
        ? `${currentMonth} '${currentYear.substring(2)}` 
        : currentMonth;
      svg += `<text x="${labelX}" y="15" font-family="Arial" font-size="12" fill="${labelColor}">${labelText}</text>`;
    }
  }

  // Add contribution boxes
  weeks.forEach((week, weekIndex) => {
    if (!week.contributionDays || !Array.isArray(week.contributionDays)) return;
    
    week.contributionDays.forEach((day, dayIndex) => {
      if (!day || typeof day.contributionCount !== 'number') return;
      
      const x = weekIndex * (boxWidth + validBoxSpacing);
      const y = dayIndex * (boxHeight + validBoxSpacing) + labelHeight; // Offset by labelHeight
      
      const count = day.contributionCount;
      let color = inactiveColor;

      if (count > 0) {
        const level = Math.min(3, Math.floor((count / (maxCount || 1)) * 4));
        color = activityColors[level];
      }

      // Format the date for the tooltip
      const date = new Date(day.date);
      const formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      // Create the contribution text
      const contributionText = count === 0 
        ? 'No contributions' 
        : `${count} contribution${count === 1 ? '' : 's'}`;

      svg += `<g>
        <title>${formattedDate}\n${contributionText}</title>
        <rect x="${x}" y="${y}" width="${boxWidth}" height="${boxHeight}" 
              rx="${validBorderRadius}" ry="${validBorderRadius}" fill="${color}"/>
      </g>`;
    });
  });

  svg += '</svg>';
  return svg;
}

function calculateDateRange(months = 12) {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - months);
  
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  
  return {
    from: from.toISOString(),
    to: to.toISOString()
  };
}

// Simple in-memory cache to prevent spamming GitHub API (helps scale embeds seamlessly)
const apiCache = new Map();
const repoCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes in milliseconds

function getCacheKey(username, from, to, repo = null) {
  return `${username}:${from}:${to}:${repo || ''}`;
}

// API Endpoint to fetch public repositories for a given user (for autocomplete)
app.get('/api/github-repos/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const cacheKey = username.toLowerCase();
    const now = Date.now();
    const cachedEntry = repoCache.get(cacheKey);

    if (cachedEntry && (now - cachedEntry.timestamp < CACHE_TTL)) {
      return res.json(cachedEntry.data);
    }

    if (!process.env.GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN environment variable is not configured.');
    }

    // Fetch up to 100 repositories sorted by recently pushed/updated
    const query = `
      query($username: String!) {
        user(login: $username) {
          repositories(first: 100, privacy: PUBLIC, orderBy: {field: PUSHED_AT, direction: DESC}) {
            nodes {
              nameWithOwner
            }
          }
        }
      }
    `;

    const response = await axios.post('https://api.github.com/graphql', {
      query,
      variables: { username }
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000
    });

    if (response.data.errors) {
      // Return empty array if user not found or has errors, rather than throwing hard 500
      if (response.data.errors.some(e => e.type === 'NOT_FOUND' || e.message.includes('Could not resolve to a User'))) {
        return res.json([]);
      }
      throw new Error(response.data.errors.map(e => e.message).join(', '));
    }

    if (!response.data.data || !response.data.data.user || !response.data.data.user.repositories) {
      return res.json([]);
    }

    const repos = response.data.data.user.repositories.nodes.map(n => n.nameWithOwner);
    
    // Cache the result
    repoCache.set(cacheKey, {
      timestamp: now,
      data: repos
    });

    res.json(repos);
  } catch (error) {
    console.error('Error fetching user repositories:', error.message);
    res.status(500).json({ error: 'Failed to fetch repositories', details: error.message });
  }
});

// API Endpoint for GitHub Contributions SVG
app.get('/api/github-contributions/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { 
      repo,
      months,
      from,
      to,
      boxSize = '12',
      boxSpacing = '3',
      borderRadius = '3',
      backgroundColor = 'transparent',
      inactiveColor = '#ebedf0',
      minActivityColor = '#9be9a8',
      maxActivityColor = '#216e39',
      showLabels = 'true',
      showYears = 'false',
      labelColor = '#24292f',
      ignoreOutliers = 'false'
    } = req.query;

    // Calculate date range based on months parameter or use provided from/to dates
    let dateRange;
    if (months) {
      dateRange = calculateDateRange(parseInt(months));
    } else if (from) {
      const toDate = to ? new Date(to) : new Date();
      toDate.setHours(23, 59, 59, 999);

      const fromDate = new Date(from);
      fromDate.setHours(0, 0, 0, 0);

      dateRange = {
        from: fromDate.toISOString(),
        to: toDate.toISOString()
      };
    } else {
      dateRange = calculateDateRange(12); // Default to 12 months
    }

    const cacheKey = getCacheKey(username, dateRange.from, dateRange.to, repo);
    const cachedEntry = apiCache.get(cacheKey);
    const now = Date.now();

    let contributions;
    if (cachedEntry && (now - cachedEntry.timestamp < CACHE_TTL)) {
      contributions = cachedEntry.data;
    } else {
      contributions = await fetchContributions(username, dateRange.from, dateRange.to, repo);

      // Clean up cache to prevent unlimited memory growth
      if (apiCache.size > 1000) {
        for (const [key, value] of apiCache.entries()) {
          if (now - value.timestamp >= CACHE_TTL) {
            apiCache.delete(key);
          }
        }
        if (apiCache.size > 1000) {
          apiCache.clear();
        }
      }

      apiCache.set(cacheKey, {
        timestamp: now,
        data: contributions
      });
    }
    
    const svg = generateSVG(contributions, {
      boxSize: Number(boxSize) || 12,
      boxSpacing: Number(boxSpacing) || 3,
      borderRadius: Number(borderRadius) || 3,
      backgroundColor,
      inactiveColor,
      minActivityColor,
      maxActivityColor,
      showLabels: showLabels !== 'false',
      showYears: showYears === 'true',
      labelColor,
      ignoreOutliers: ignoreOutliers === 'true'
    });

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(svg);
  } catch (error) {
    console.error('Error in contributions route:', error.message);
    res.status(500).json({ error: 'Failed to fetch contributions', details: error.message });
  }
});

// Serve frontend static files from the Vite build 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Serve index.html for client-side routing on any non-API path
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start express server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
