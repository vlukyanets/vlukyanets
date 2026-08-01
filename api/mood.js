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

  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=1800, stale-while-revalidate=1800');
  res.status(200).json({
    schemaVersion: 1,
    label: 'current mood',
    message: mood.message,
    color: mood.color,
  });
};
