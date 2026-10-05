// Local time in Lviv (the Europe/Kyiv zone), shared by the uptime and mood badges. Files starting with "_" are not routes.
const WAKE_UP = 8 * 60; // 08:00
const AWAKE = 17 * 60; // until 01:00

const format = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Europe/Kyiv', hourCycle: 'h23',
  year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', weekday: 'short',
});

// {
//   day: local date as days since 1970-01-01, for picks that change once a day,
//   minutes: minutes since local midnight,
//   weekday: 'Mon'..'Sun',
//   awakeMinutes: minutes since waking up, or null while asleep,
// }
module.exports = (now = Date.now()) => {
  const parts = Object.fromEntries(format.formatToParts(now)
    .map(({ type, value }) => [type, type === 'weekday' ? value : Number(value)]));
  const minutes = parts.hour * 60 + parts.minute;
  const sinceWakeUp = (minutes - WAKE_UP + 24 * 60) % (24 * 60);
  return {
    day: Date.UTC(parts.year, parts.month - 1, parts.day) / (24 * 60 * 60 * 1000),
    minutes,
    weekday: parts.weekday,
    awakeMinutes: sinceWakeUp < AWAKE ? sinceWakeUp : null,
  };
};

module.exports.WAKE_UP = WAKE_UP;
