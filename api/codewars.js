const badge = require('./_badge');

// Codewars rank colors as they appear on the site
const RANK_COLORS = {
  white: 'e6e6e6', yellow: 'ecb613', blue: '3c7ebb', purple: '866cc7', black: '333333', red: 'b1361e',
};

module.exports = async (req, res) => {
  let data;
  try {
    const response = await fetch('https://www.codewars.com/api/v1/users/vlukyanets', {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Codewars API responded ${response.status}`);
    data = await response.json();
  } catch (err) {
    console.error(err);
    // short cache so the badge recovers soon after Codewars is back
    return badge(res, 'codewars', 'unavailable', 'lightgrey', 300);
  }

  const completed = data.codeChallenges?.totalCompleted ?? 0;
  const rank = data.ranks?.overall?.name ?? 'unranked';
  const color = RANK_COLORS[data.ranks?.overall?.color] ?? 'lightgrey';
  badge(res, 'codewars', `${completed} kata solved (${rank})`, color);
};
