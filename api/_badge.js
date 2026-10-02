// Shared shields.io endpoint response. Files starting with "_" are not deployed as routes.
module.exports = (res, label, message, color, cacheSeconds = 1800) => {
  res.setHeader('Cache-Control', `public, max-age=0, s-maxage=${cacheSeconds}, stale-while-revalidate=${cacheSeconds}`);
  res.status(200).json({ schemaVersion: 1, label, message, color });
};
