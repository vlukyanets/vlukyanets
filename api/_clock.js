// Local time in Lviv (the Europe/Kyiv zone), shared by the uptime and mood badges. Files starting with "_" are not routes.
const WAKE_UP = 8 * 60; // 08:00
const AWAKE = 17 * 60; // until 01:00

const format = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Europe/Kyiv', hourCycle: 'h23', hour: 'numeric', minute: 'numeric', weekday: 'short',
});

// { weekday: 'Mon'..'Sun', awakeMinutes: minutes since waking up, or null while asleep }
module.exports = (now = Date.now()) => {
  const parts = Object.fromEntries(format.formatToParts(now).map(({ type, value }) => [type, value]));
  const sinceWakeUp = (Number(parts.hour) * 60 + Number(parts.minute) - WAKE_UP + 24 * 60) % (24 * 60);
  return { weekday: parts.weekday, awakeMinutes: sinceWakeUp < AWAKE ? sinceWakeUp : null };
};
