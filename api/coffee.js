const badge = require('./_badge');

const START = Date.UTC(2014, 1, 3);
const CUPS_PER_YEAR = 1000;
const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;

module.exports = (req, res) => {
  const cups = Math.ceil((Date.now() - START) / YEAR_MS * CUPS_PER_YEAR);
  badge(res, 'coffee consumed', `${cups.toLocaleString('en-US')} cups`, '6f4e37', 1800, { namedLogo: 'buymeacoffee' });
};
