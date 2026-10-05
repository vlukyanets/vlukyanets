const badge = require('./_badge');

// TIOBE index top 50 (https://www.tiobe.com/tiobe-index/), plus a few requested extras.
// [name, English Wikipedia article, shields.io logo slug if it has one]
const LANGUAGES = [
  ['Python', 'Python_(programming_language)', 'python'],
  ['C', 'C_(programming_language)', 'c'],
  ['C++', 'C++', 'cplusplus'],
  ['Java', 'Java_(programming_language)', 'openjdk'],
  ['C#', 'C_Sharp_(programming_language)'],
  ['JavaScript', 'JavaScript', 'javascript'],
  ['Visual Basic', 'Visual_Basic_(.NET)'],
  ['SQL', 'SQL'],
  ['R', 'R_(programming_language)', 'r'],
  ['Rust', 'Rust_(programming_language)', 'rust'],
  ['Delphi/Object Pascal', 'Object_Pascal', 'delphi'],
  ['Scratch', 'Scratch_(programming_language)', 'scratch'],
  ['Go', 'Go_(programming_language)', 'go'],
  ['PHP', 'PHP', 'php'],
  ['Swift', 'Swift_(programming_language)', 'swift'],
  ['Ada', 'Ada_(programming_language)', 'ada'],
  ['Assembly language', 'Assembly_language'],
  ['MATLAB', 'MATLAB'],
  ['Fortran', 'Fortran', 'fortran'],
  ['Ruby', 'Ruby_(programming_language)', 'ruby'],
  ['Classic Visual Basic', 'Visual_Basic_(classic)'],
  ['Perl', 'Perl', 'perl'],
  ['COBOL', 'COBOL'],
  ['Prolog', 'Prolog'],
  ['SAS', 'SAS_language'],
  ['LabVIEW', 'LabVIEW', 'labview'],
  ['Julia', 'Julia_(programming_language)', 'julia'],
  ['Kotlin', 'Kotlin', 'kotlin'],
  ['VBScript', 'VBScript'],
  ['Objective-C', 'Objective-C'],
  ['GML', 'GameMaker', 'gamemaker'],
  ['Dart', 'Dart_(programming_language)', 'dart'],
  ['Lisp', 'Lisp_(programming_language)', 'commonlisp'],
  ['Lua', 'Lua', 'lua'],
  ['PL/SQL', 'PL/SQL'],
  ['OCaml', 'OCaml', 'ocaml'],
  ['Transact-SQL', 'Transact-SQL'],
  ['Caml', 'Caml'],
  ['ML', 'ML_(programming_language)'],
  ['ABAP', 'ABAP', 'sap'],
  ['D', 'D_(programming_language)', 'd'],
  ['VHDL', 'VHDL'],
  ['Ladder Logic', 'Ladder_logic'],
  ['X++', 'Microsoft_Dynamics_365'],
  ['PowerShell', 'PowerShell'],
  ['Haskell', 'Haskell', 'haskell'],
  ['TypeScript', 'TypeScript', 'typescript'],
  ['Zig', 'Zig_(programming_language)', 'zig'],
  ['Scala', 'Scala_(programming_language)', 'scala'],
  ['CFML', 'ColdFusion_Markup_Language'],
  // requested extras not already in top 50
  ['Bash', 'Bash_(Unix_shell)', 'gnubash'],
  ['F#', 'F_Sharp_(programming_language)', 'fsharp'],
  ['Tcl', 'Tcl_(programming_language)'],
  ['Brainfuck', 'Brainfuck'],
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
  const [name, article, logo] = LANGUAGES[hash(Math.floor(now / 3600)) % LANGUAGES.length];
  // cache until the hour ends so the badge and the link switch on time
  const secondsLeft = 3600 - (now % 3600);

  // ?go sends the README link to the Wikipedia article of the current language
  if (req.query?.go !== undefined) {
    res.setHeader('Cache-Control', `public, max-age=0, s-maxage=${secondsLeft}`);
    return res.redirect(302, `https://en.wikipedia.org/wiki/${article}`);
  }
  badge(res, 'language of the hour', name, 'blueviolet', secondsLeft, logo && { namedLogo: logo });
};
