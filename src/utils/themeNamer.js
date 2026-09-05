// Auto-naming for community themes using meodai/color-names
// (https://github.com/meodai/color-names, MIT).
// Primary: nearest "bestOf" name via the free public API (no bundle cost).
// Fallback: nearest match against a small vendored subset below (same dataset,
// classic CSS/xkcd entries) so publishing works offline.

const FALLBACK_NAMES = [
  ['white', '#ffffff'], ['snow', '#fffafa'], ['ivory', '#fffff0'],
  ['light grey', '#d3d3d3'], ['silver', '#c0c0c0'], ['grey', '#808080'],
  ['charcoal', '#36454f'], ['black', '#000000'], ['midnight', '#191970'],
  ['navy', '#000080'], ['royal blue', '#4169e1'], ['ocean blue', '#4f42b5'],
  ['sky blue', '#87ceeb'], ['powder blue', '#b0e0e6'], ['teal', '#008080'],
  ['sea green', '#2e8b57'], ['forest green', '#228b22'], ['bucolic', '#1b6634'],
  ['mint', '#98ff98'], ['lime', '#00ff00'], ['olive', '#808000'],
  ['khaki', '#f0e68c'], ['amber', '#ffbf00'], ['gold', '#ffd700'],
  ['orange', '#ffa500'], ['sunset orange', '#fd5e53'], ['coral', '#ff7f50'],
  ['salmon', '#fa8072'], ['crimson', '#dc143c'], ['red', '#ff0000'],
  ['maroon', '#800000'], ['wine', '#722f37'], ['plum', '#dda0dd'],
  ['orchid', '#da70d6'], ['purple', '#800080'], ['violet', '#8f00ff'],
  ['indigo', '#4b0082'], ['lavender', '#e6e6fa'], ['pink', '#ffc0cb'],
  ['hot pink', '#ff69b4'], ['magenta', '#ff00ff'], ['candy pink', '#e4717a'],
  ['peach', '#ffe5b4'], ['tan', '#d2b48c'], ['chocolate', '#d2691e'],
  ['coffee', '#6f4e37'], ['beige', '#f5f5dc'], ['cream', '#fffdd0'],
  ['yellow', '#ffff00'], ['mustard', '#ffdb58'], ['cyan', '#00ffff'],
  ['turquoise', '#40e0d0'], ['aqua', '#00ffff'], ['slate', '#708090'],
];

function hexToRgb(hex) {
  return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
}

function closestFallback(hex) {
  const [r, g, b] = hexToRgb(hex.toLowerCase());
  let best = FALLBACK_NAMES[0][0];
  let bestDist = Infinity;
  for (const [name, ref] of FALLBACK_NAMES) {
    const [r2, g2, b2] = hexToRgb(ref);
    const dist = (r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = name;
    }
  }
  return best;
}

export function sanitizeThemeName(raw) {
  const clean = (raw || '')
    .toLowerCase()
    .replace(/[^a-z0-9 _-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 28);
  return clean.length >= 3 ? clean : 'untitled theme';
}

// Name a theme from all three colors: inactive + min + max activity.
// Tries the full triple, degrades to min + max, then max alone.
export async function autoThemeName({ inactiveColor, minActivityColor, maxActivityColor }) {
  const vals = [inactiveColor, minActivityColor, maxActivityColor]
    .map(h => h.replace('#', ''))
    .join(',');
  try {
    const res = await fetch(`https://api.color.pizza/v1/?values=${vals}&list=bestOf`);
    if (res.ok) {
      const data = await res.json();
      const names = (data?.colors || []).map(c => c.name);
      if (names.length === 3) {
        return combineNames(names.map(sanitizeThemeName));
      }
    }
  } catch {
    // offline — fall through to local list
  }
  return combineNames(
    [inactiveColor, minActivityColor, maxActivityColor].map(closestFallback)
  );
}

function combineNames([inactive, min, max]) {
  const parts = [inactive, min, max].filter((n, i, arr) => n && arr.indexOf(n) === i);
  for (let len = parts.length; len > 0; len--) {
    const candidate = parts.slice(parts.length - len).join(' ');
    if (candidate.length >= 3 && candidate.length <= 28) return candidate;
  }
  return max && max.length >= 3 ? max.slice(0, 28) : 'untitled theme';
}
