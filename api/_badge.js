// Shared shields.io endpoint response. Files starting with "_" are not deployed as routes.
// `extra` takes other endpoint fields, e.g. { namedLogo: 'codewars' }.
// cacheSeconds sets both the Vercel edge cache and the shields.io badge cache;
// shields.io never caches an endpoint badge for less than 300 seconds.
module.exports = (res, label, message, color, cacheSeconds = 1800, extra = {}) => {
  res.setHeader('Cache-Control', `public, max-age=0, s-maxage=${cacheSeconds}`);
  res.status(200).json({ schemaVersion: 1, label, message, color, cacheSeconds, ...extra });
};
