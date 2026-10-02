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

test('uptime, mood, language and coffee return shields endpoint JSON', async () => {
  for (const name of ['uptime', 'mood', 'language', 'coffee']) {
    for (let i = 0; i < 50; i++) assertBadge(await call(name));
  }
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
