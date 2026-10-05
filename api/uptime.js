const badge = require('./_badge');
const clock = require('./_clock');

// the badge follows the clock, so refresh it as often as shields.io allows
const CACHE_SECONDS = 300;

module.exports = (req, res) => {
  const { awakeMinutes } = clock();
  if (awakeMinutes === null) return badge(res, 'uptime', 'chilling (offline)', 'blue', CACHE_SECONDS);

  const hours = Math.floor(awakeMinutes / 60);
  const minutes = awakeMinutes % 60;
  const time = hours < 1 ? `${minutes}m` : `${hours}h ${minutes}m`;

  if (hours < 1) return badge(res, 'uptime', `${time} (fresh)`, 'brightgreen', CACHE_SECONDS);
  if (hours < 4) return badge(res, 'uptime', time, 'green', CACHE_SECONDS);
  if (hours < 10) return badge(res, 'uptime', `${time} (needs coffee)`, 'yellow', CACHE_SECONDS);
  if (hours < 16) return badge(res, 'uptime', `${time} (running on fumes)`, 'orange', CACHE_SECONDS);
  return badge(res, 'uptime', `${time} (send help)`, 'critical', CACHE_SECONDS);
};
