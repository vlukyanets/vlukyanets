const badge = require('./_badge');

// TIOBE index top 50 (https://www.tiobe.com/tiobe-index/), plus a few requested extras.
const LANGUAGES = [
  'Python', 'C', 'C++', 'Java', 'C#', 'JavaScript', 'Visual Basic', 'SQL', 'R',
  'Rust', 'Delphi/Object Pascal', 'Scratch', 'Go', 'PHP', 'Swift', 'Ada',
  'Assembly language', 'MATLAB', 'Fortran', 'Ruby', 'Classic Visual Basic',
  'Perl', 'COBOL', 'Prolog', 'SAS', 'LabVIEW', 'Julia', 'Kotlin', 'VBScript',
  'Objective-C', 'GML', 'Dart', 'Lisp', 'Lua', 'PL/SQL', 'OCaml',
  'Transact-SQL', 'Caml', 'ML', 'ABAP', 'D', 'VHDL', 'Ladder Logic', 'X++',
  'PowerShell', 'Haskell', 'TypeScript', 'Zig', 'Scala', 'CFML',
  // requested extras not already in top 50
  'Bash', 'F#', 'Tcl', 'Brainfuck',
];

// Integer hash (lowbias32) so the pick looks random but is the same for everyone within an hour.
const hash = (x) => {
  x ^= x >>> 16; x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15; x = Math.imul(x, 0x846ca68b);
  x ^= x >>> 16;
  return x >>> 0;
};

module.exports = (req, res) => {
  const now = Math.floor(Date.now() / 1000);
  const language = LANGUAGES[hash(Math.floor(now / 3600)) % LANGUAGES.length];
  // cache until the hour ends so the badge switches on time
  badge(res, 'language of hour', language, 'blueviolet', 3600 - (now % 3600));
};
