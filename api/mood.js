const badge = require('./_badge');

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

module.exports = (req, res) => {
  const mood = MOODS[Math.floor(Math.random() * MOODS.length)];
  badge(res, 'current mood', mood.message, mood.color);
};
