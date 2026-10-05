const badge = require('./_badge');
const clock = require('./_clock');

const MOODS = [
  { message: 'compiling', color: 'blue' },
  { message: 'debugging', color: 'orange' },
  { message: 'refactoring', color: 'yellow' },
  { message: 'shipping', color: 'brightgreen' },
  { message: 'reading stack traces', color: 'red' },
  { message: 'yak shaving', color: 'lightgrey' },
  { message: 'fighting merge conflicts', color: 'critical' },
  { message: 'staring at a blinking cursor', color: 'lightgrey' },
  { message: 'chasing a segfault', color: 'red' },
  { message: 'optimizing prematurely', color: 'yellow' },
  { message: 'writing tests (for once)', color: 'brightgreen' },
  { message: 'googling the error message', color: 'orange' },
  { message: 'waiting for CI', color: 'blue' },
  { message: 'rubber duck debugging', color: 'yellow' },
];

// extra moods for some days of the week, picked half the time on those days
const DAY_MOODS = {
  Mon: [{ message: 'fighting merge conflicts', color: 'critical' }, { message: 'catching up on the weekend\'s CI failures', color: 'red' }],
  Fri: [{ message: 'not deploying on Friday', color: 'brightgreen' }],
  Sat: [{ message: 'touching grass', color: 'green' }],
  Sun: [{ message: 'touching grass', color: 'green' }, { message: 'side project time', color: 'blueviolet' }],
};
const ASLEEP = { message: 'asleep (probably)', color: 'lightgrey' };

const pick = (moods) => moods[Math.floor(Math.random() * moods.length)];

module.exports = (req, res) => {
  const { weekday, awakeMinutes } = clock();
  const today = DAY_MOODS[weekday];
  let mood = ASLEEP;
  if (awakeMinutes !== null) mood = today && Math.random() < 0.5 ? pick(today) : pick(MOODS);
  badge(res, 'current mood', mood.message, mood.color);
};

// read by the tests
module.exports.MOODS = MOODS;
module.exports.DAY_MOODS = DAY_MOODS;
