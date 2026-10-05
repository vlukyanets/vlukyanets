// Run with `node --test`. Lives outside api/ because every file there becomes a Vercel route.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const call = async (name, req = {}) => {
  const res = { headers: {} };
  res.setHeader = (key, value) => { res.headers[key] = value; };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.body = body; };
  res.redirect = (code, url) => { res.statusCode = code; res.location = url; };
  await require(`../api/${name}`)(req, res);
  return res;
};

const assertBadge = (res) => {
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.schemaVersion, 1);
  for (const key of ['label', 'message', 'color']) assert.ok(res.body[key], `${key} is empty`);
  // shields.io reads the cache length from the JSON, Vercel from the header
  assert.strictEqual(res.headers['Cache-Control'], `public, max-age=0, s-maxage=${res.body.cacheSeconds}`);
};

const withFetch = async (fake, fn) => {
  const realFetch = global.fetch;
  global.fetch = fake;
  try { await fn(); } finally { global.fetch = realFetch; }
};

// Math.random returns the given values in order
const mockRandom = (t, ...values) => {
  let i = 0;
  t.mock.method(Math, 'random', () => values[i++]);
};

test('language and coffee return shields endpoint JSON', async () => {
  for (const name of ['language', 'coffee']) assertBadge(await call(name));
});

// Lviv is UTC+2 in winter and UTC+3 in summer; 5 Jan 2026 is a Monday
const kyivWinter = (day, hour, minute = 0) => Date.UTC(2026, 0, day, hour - 2, minute);

test('uptime counts from 08:00 Lviv time and is offline from 01:00', async (t) => {
  t.mock.method(Date, 'now', () => 0);
  const cases = [
    [kyivWinter(6, 8), '0m (fresh)', 'brightgreen'],
    [kyivWinter(6, 8, 59), '59m (fresh)', 'brightgreen'],
    [kyivWinter(6, 9), '1h 0m', 'green'],
    [kyivWinter(6, 12), '4h 0m (needs coffee)', 'yellow'],
    [kyivWinter(6, 18), '10h 0m (running on fumes)', 'orange'],
    [kyivWinter(7, 0), '16h 0m (send help)', 'critical'],
    [kyivWinter(7, 0, 59), '16h 59m (send help)', 'critical'],
    [kyivWinter(7, 1), 'chilling (offline)', 'blue'],
    [kyivWinter(7, 7, 59), 'chilling (offline)', 'blue'],
    // summer time: 05:00 UTC is 08:00 in Lviv
    [Date.UTC(2026, 6, 7, 5), '0m (fresh)', 'brightgreen'],
  ];
  for (const [now, message, color] of cases) {
    Date.now.mock.mockImplementation(() => now);
    const res = await call('uptime');
    assertBadge(res);
    assert.deepStrictEqual([res.body.message, res.body.color], [message, color], new Date(now).toISOString());
  }
});

test('mood picks every mood on a plain day', async (t) => {
  const { MOODS } = require('../api/mood');
  t.mock.method(Date, 'now', () => kyivWinter(6, 12)); // Tuesday noon
  for (let i = 0; i < MOODS.length; i++) {
    mockRandom(t, (i + 0.5) / MOODS.length);
    const res = await call('mood');
    assertBadge(res);
    assert.strictEqual(res.body.message, MOODS[i].message);
    Math.random.mock.restore();
  }
});

test('mood picks day moods half the time on their days', async (t) => {
  const { MOODS, DAY_MOODS } = require('../api/mood');
  t.mock.method(Date, 'now', () => 0);
  // 5 Jan 2026 is a Monday, so day 5 + i is Mon..Sun
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  for (const [weekday, moods] of Object.entries(DAY_MOODS)) {
    Date.now.mock.mockImplementation(() => kyivWinter(5 + weekdays.indexOf(weekday), 12));
    mockRandom(t, 0.25, 0);
    assert.strictEqual((await call('mood')).body.message, moods[0].message, weekday);
    Math.random.mock.restore();
    mockRandom(t, 0.75, 0);
    assert.strictEqual((await call('mood')).body.message, MOODS[0].message, weekday);
    Math.random.mock.restore();
  }
});

test('mood is asleep while uptime is offline', async (t) => {
  t.mock.method(Date, 'now', () => kyivWinter(7, 3));
  const res = await call('mood');
  assertBadge(res);
  assert.strictEqual(res.body.message, 'asleep (probably)');
});

test('language list has an article and a valid logo slug for each entry', () => {
  const { LANGUAGES } = require('../api/language');
  for (const [name, article, logo] of LANGUAGES) {
    assert.match(article, /^\S+$/, name);
    if (logo !== undefined) assert.match(logo, /^[a-z0-9]+$/, name);
  }
  assert.strictEqual(new Set(LANGUAGES.map(([name]) => name)).size, LANGUAGES.length, 'duplicate language');
});

test('language stays the same within an hour', async (t) => {
  const hourStart = Date.UTC(2026, 0, 1, 12);
  t.mock.method(Date, 'now', () => hourStart);
  const first = (await call('language')).body.message;
  Date.now.mock.mockImplementation(() => hourStart + 3599 * 1000);
  const last = (await call('language')).body;
  assert.strictEqual(last.message, first);
  // cached until the hour ends
  assert.strictEqual(last.cacheSeconds, 1);
});

test('language link redirects to Wikipedia', async (t) => {
  t.mock.method(Date, 'now', () => Date.UTC(2026, 0, 1, 12));
  const res = await call('language', { query: { go: '' } });
  assert.strictEqual(res.statusCode, 302);
  assert.match(res.location, /^https:\/\/en\.wikipedia\.org\/wiki\/\S+$/);
});

test('coffee counts 1000 cups a year since 3 Feb 2014', async (t) => {
  t.mock.method(Date, 'now', () => Date.UTC(2014, 1, 3) + 365.25 * 24 * 60 * 60 * 1000);
  assert.strictEqual((await call('coffee')).body.message, '1,000 cups');
});

test('codewars colors the badge by rank', () => withFetch(
  async () => ({ ok: true, json: async () => ({
    codeChallenges: { totalCompleted: 42 },
    ranks: { overall: { name: '1 kyu', color: 'purple' } },
  }) }),
  async () => {
    const res = await call('codewars');
    assertBadge(res);
    assert.strictEqual(res.body.message, '42 kata solved (1 kyu)');
    assert.strictEqual(res.body.color, '866cc7');
  },
));

test('codewars falls back when the API is down', () => withFetch(
  async () => ({ ok: false, status: 503 }),
  async () => {
    const realError = console.error;
    console.error = () => {};
    try {
      const res = await call('codewars');
      assertBadge(res);
      assert.strictEqual(res.body.message, 'unavailable');
      assert.strictEqual(res.body.cacheSeconds, 300);
    } finally { console.error = realError; }
  },
));

test('README badges and the weekly link check use existing endpoints', () => {
  const root = path.join(__dirname, '..');
  const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
  const endpoints = (text) => [...new Set([...text.matchAll(/vlukyanets\.vercel\.app\/api\/(\w+)/g)].map((m) => m[1]))].sort();
  const routes = fs.readdirSync(path.join(root, 'api'))
    .filter((file) => file.endsWith('.js') && !file.startsWith('_'))
    .map((file) => file.slice(0, -3))
    .sort();

  // a new endpoint is merged before its README badge, so README may lag behind
  const readme = read('README.md');
  for (const name of endpoints(readme)) assert.ok(routes.includes(name), `README uses missing api/${name}.js`);
  // shields.io takes the longest of the URL and JSON cacheSeconds, so a URL value would override the endpoint's
  assert.doesNotMatch(readme, /cacheSeconds=/, 'set cacheSeconds in the endpoint, not the README badge URL');
  assert.deepStrictEqual(endpoints(read('.github/workflows/links.yml')), routes, 'links.yml endpoints differ from api/');
});
