// Run with `node --test`. Lives outside api/ because every file there becomes a Vercel route.
const test = require('node:test');
const assert = require('node:assert');

const call = async (name) => {
  const res = { headers: {} };
  res.setHeader = (key, value) => { res.headers[key] = value; };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.body = body; };
  await require(`../api/${name}`)({}, res);
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

test('uptime, mood and language return shields endpoint JSON', async () => {
  for (const name of ['uptime', 'mood', 'language']) {
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
