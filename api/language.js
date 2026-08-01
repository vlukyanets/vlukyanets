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

module.exports = (req, res) => {
  const language = LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)];

  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=3600');
  res.status(200).json({
    schemaVersion: 1,
    label: "language of hour",
    message: language,
    color: 'blueviolet',
  });
};
