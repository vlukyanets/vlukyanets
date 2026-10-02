module.exports = async (req, res) => {
  let badge;
  try {
    const response = await fetch('https://www.codewars.com/api/v1/users/vlukyanets', {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Codewars API responded ${response.status}`);
    const data = await response.json();

    const completed = data.codeChallenges?.totalCompleted ?? 0;
    const rank = data.ranks?.overall?.name ?? 'unranked';

    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=1800, stale-while-revalidate=1800');
    badge = { message: `${completed} kata solved (${rank})`, color: 'red' };
  } catch (err) {
    console.error(err);
    // short cache so the badge recovers soon after Codewars is back
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300');
    badge = { message: 'unavailable', color: 'lightgrey' };
  }

  res.status(200).json({ schemaVersion: 1, label: 'codewars', ...badge });
};
