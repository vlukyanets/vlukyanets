// Integer hash (lowbias32): picks that look random but are the same for everyone
// for the same input, e.g. the current hour or day. Files starting with "_" are not routes.
module.exports = (x) => {
  x ^= x >>> 16; x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15; x = Math.imul(x, 0x846ca68b);
  x ^= x >>> 16;
  return x >>> 0;
};
