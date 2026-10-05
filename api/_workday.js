// The day's working hours, shared by the uptime and mood badges. Files starting with "_" are not routes.
const hash = require('./_hash');

const START = 9 * 60; // starts between 09:00
const START_SPREAD = 3 * 60; // and 12:00
const MIN_LENGTH = 4 * 60; // and lasts 4
const MAX_LENGTH = 12 * 60; // to 12 hours

// { start, length } in minutes for a day from _clock; random-looking, but the same for everyone all day
module.exports = (day) => ({
  start: START + hash(2 * day) % (START_SPREAD + 1),
  length: MIN_LENGTH + hash(2 * day + 1) % (MAX_LENGTH - MIN_LENGTH + 1),
});
