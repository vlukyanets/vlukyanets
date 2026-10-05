// Checks what the deployed badge endpoints return, not just that they answer 200.
// Prints a Markdown report and exits 1 on problems. Kept out of test/ so `node --test` doesn't run it.
const fs = require('node:fs');
const path = require('node:path');

const BASE = 'https://vlukyanets.vercel.app/api/';

// messages a badge shows when its data source broke, though the endpoint still answers 200
const BROKEN = {
  codewars: /unavailable|unranked/,
};

const check = async (name) => {
  let body;
  try {
    const response = await fetch(BASE + name, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) return `responded ${response.status}`;
    body = await response.json();
  } catch (err) {
    return `request failed: ${err.message}`;
  }
  if (body.schemaVersion !== 1) return `schemaVersion is ${body.schemaVersion}`;
  for (const key of ['label', 'message', 'color']) if (!body[key]) return `${key} is empty`;
  if (!Number.isInteger(body.cacheSeconds)) return 'cacheSeconds is missing';
  if (BROKEN[name]?.test(body.message)) return `shows "${body.message}"`;
  return null;
};

(async () => {
  const names = fs.readdirSync(path.join(__dirname, '../../api'))
    .filter((file) => file.endsWith('.js') && !file.startsWith('_'))
    .map((file) => file.slice(0, -3));
  const problems = (await Promise.all(names.map(async (name) => [name, await check(name)])))
    .filter(([, problem]) => problem);

  console.log('## Badge endpoints\n');
  if (!problems.length) return console.log(`All ${names.length} endpoints OK.\n`);
  for (const [name, problem] of problems) console.log(`- \`${BASE}${name}\`: ${problem}`);
  console.log();
  process.exitCode = 1;
})();
