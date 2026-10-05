// Run with `node --test`. Lives outside api/ because every file there becomes a Vercel route.
const test = require('node:test');
const assert = require('node:assert');

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

test('uptime covers every range', async (t) => {
  // the middle of the Math.random range that maps to `m` minutes
  const minutes = (m) => (m - 0.5) / (24 * 60);
  const cases = [
    [[0.05], 'chilling (offline)', 'blue'],
    [[0.5, minutes(1)], '1m (fresh)', 'brightgreen'],
    [[0.5, minutes(59)], '59m (fresh)', 'brightgreen'],
    [[0.5, minutes(60)], '1h 0m', 'green'],
    [[0.5, minutes(4 * 60)], '4h 0m (needs coffee)', 'yellow'],
    [[0.5, minutes(10 * 60)], '10h 0m (running on fumes)', 'orange'],
    [[0.5, minutes(16 * 60)], '16h 0m (send help)', 'critical'],
    [[0.5, minutes(24 * 60)], '24h 0m (send help)', 'critical'],
  ];
  for (const [randoms, message, color] of cases) {
    mockRandom(t, ...randoms);
    const res = await call('uptime');
    assertBadge(res);
    assert.deepStrictEqual([res.body.message, res.body.color], [message, color]);
    Math.random.mock.restore();
  }
});

test('mood picks every mood', async (t) => {
  const { MOODS } = require('../api/mood');
  for (let i = 0; i < MOODS.length; i++) {
    mockRandom(t, (i + 0.5) / MOODS.length);
    const res = await call('mood');
    assertBadge(res);
    assert.strictEqual(res.body.message, MOODS[i].message);
    Math.random.mock.restore();
  }
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
  assert.strictEqual((await call('language')).body.message, first);
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
    } finally { console.error = realError; }
  },
));
