const badge = require('./_badge');

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
  badge(res, 'codewars', `${completed} kata solved (${rank})`, 'red');
};
