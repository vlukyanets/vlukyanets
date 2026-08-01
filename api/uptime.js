module.exports = (req, res) => {
  const totalMinutes = 5 + Math.floor(Math.random() * (20 * 60 - 5 + 1));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  let message;
  let color;
  if (hours < 1) {
    message = `${minutes}m (fresh)`;
    color = 'brightgreen';
  } else if (hours < 4) {
    message = `${hours}h ${minutes}m`;
    color = 'green';
  } else if (hours < 10) {
    message = `${hours}h ${minutes}m (needs coffee)`;
    color = 'yellow';
  } else if (hours < 16) {
    message = `${hours}h ${minutes}m (running on fumes)`;
    color = 'orange';
  } else {
    message = `${hours}h ${minutes}m (send help)`;
    color = 'critical';
  }

  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=1800, stale-while-revalidate=1800');
  res.status(200).json({
    schemaVersion: 1,
    label: 'uptime',
    message,
    color,
  });
};
