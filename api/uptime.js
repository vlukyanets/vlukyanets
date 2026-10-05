const badge = require('./_badge');
const clock = require('./_clock');
const workday = require('./_workday');

// the badge follows the clock, so refresh it as often as shields.io allows
const CACHE_SECONDS = 300;

const duration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  return hours < 1 ? `${minutes}m` : `${hours}h ${minutes % 60}m`;
};

module.exports = (req, res) => {
  const { day, minutes } = clock();
  const { start, length } = workday(day);
  const send = (message, color) => badge(res, 'uptime', message, color, CACHE_SECONDS);

  if (minutes < start) return send('chilling (offline)', 'blue');
  const worked = minutes - start;
  if (worked >= length) return send(`logged off after ${duration(length)}`, 'lightgrey');

  const time = duration(worked);
  const left = length - worked;
  if (worked < 60) return send(`${time} (fresh)`, 'brightgreen');
  if (left <= 30) return send(`${time} (wrapping up)`, 'blue');
  if (worked < length / 2) return send(time, 'green');
  if (worked < length * 0.8) return send(`${time} (needs coffee)`, 'yellow');
  // the last stretch of a long day
  if (length >= 10 * 60) return send(`${time} (send help)`, 'critical');
  return send(`${time} (running on fumes)`, 'orange');
};
