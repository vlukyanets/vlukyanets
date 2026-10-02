const badge = require('./_badge');

const CHILLING_CHANCE = 0.1;

module.exports = (req, res) => {
  if (Math.random() < CHILLING_CHANCE) return badge(res, 'uptime', 'chilling (offline)', 'blue');

  const totalMinutes = 1 + Math.floor(Math.random() * 24 * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const time = hours < 1 ? `${minutes}m` : `${hours}h ${minutes}m`;

  if (hours < 1) return badge(res, 'uptime', `${time} (fresh)`, 'brightgreen');
  if (hours < 4) return badge(res, 'uptime', time, 'green');
  if (hours < 10) return badge(res, 'uptime', `${time} (needs coffee)`, 'yellow');
  if (hours < 16) return badge(res, 'uptime', `${time} (running on fumes)`, 'orange');
  return badge(res, 'uptime', `${time} (send help)`, 'critical');
};
