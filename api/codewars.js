module.exports = async (req, res) => {
  const response = await fetch('https://www.codewars.com/api/v1/users/vlukyanets');
  const data = await response.json();

  const completed = data.codeChallenges?.totalCompleted ?? 0;
  const rank = data.ranks?.overall?.name ?? 'unranked';

  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=1800, stale-while-revalidate=1800');
  res.status(200).json({
    schemaVersion: 1,
    label: 'codewars',
    message: `${completed} kata solved (${rank})`,
    color: 'red',
  });
};
