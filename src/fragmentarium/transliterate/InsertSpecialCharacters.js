const characters = {
  'Ā': { 'win': 'Ctrl-Shift-a', 'mac': 'Command-Shift-a' },
  'ā': { 'win': 'Ctrl-a', 'mac': 'Command-a' },
  'Ē': { 'win': 'Ctrl-Shift-e', 'mac': 'Command-Shift-e' },
  'ē': { 'win': 'Ctrl-e', 'mac': 'Command-e' },
  'Ī': { 'win': 'Ctrl-Shift-i', 'mac': 'Command-Shift-i' },
  'ī': { 'win': 'Ctrl-i', 'mac': 'Command-i' },
  'Ū': { 'win': 'Ctrl-Shift-u', 'mac': 'Command-Shift-u' },
  'ū': { 'win': 'Ctrl-u', 'mac': 'Command-u' },
  'Â': { 'win': 'Alt-Shift-a', 'mac': 'Option-Shift-a' },
  'â': { 'win': 'Alt-a', 'mac': 'Option-a' },
  'Ê': { 'win': 'Alt-Shift-e', 'mac': 'Option-Shift-e' },
  'ê': { 'win': 'Alt-e', 'mac': 'Option-e' },
  'Î': { 'win': 'Alt-Shift-i', 'mac': 'Option-Shift-i' },
  'î': { 'win': 'Alt-i', 'mac': 'Option-i' },
  'Û': { 'win': 'Alt-Shift-u', 'mac': 'Option-Shift-u' },
  'û': { 'win': 'Alt-u', 'mac': 'Option-u' },
  'Š': { 'win': 'Ctrl-Shift-s', 'mac': 'Command-Shift-s' },
  'š': { 'win': 'Ctrl-s', 'mac': 'Command-s' },
  'Ṣ': { 'win': 'Alt-Shift-s', 'mac': 'Option-Shift-s' },
  'ṣ': { 'win': 'Alt-s', 'mac': 'Option-s' },
  'Ṭ': { 'win': 'Alt-Shift-t', 'mac': 'Option-Shift-t' },
  'ṭ': { 'win': 'Alt-t', 'mac': 'Option-t' },
  'ʾ': { 'win': 'Ctrl-\'', 'mac': 'Option-\'' },
  'Ĝ': { 'win': 'Alt-Shift-g', 'mac': 'Option-Shift-g' },
  'ĝ': { 'win': 'Alt-g', 'mac': 'Option-g' },
  '₁': { 'win': 'Ctrl-1', 'mac': 'Command-1' },
  '₂': { 'win': 'Ctrl-2', 'mac': 'Command-2' },
  '₃': { 'win': 'Ctrl-3', 'mac': 'Command-3' },
  '₄': { 'win': 'Ctrl-4', 'mac': 'Command-4' },
  '₅': { 'win': 'Ctrl-5', 'mac': 'Command-5' },
  '₆': { 'win': 'Ctrl-6', 'mac': 'Command-6' },
  '₇': { 'win': 'Ctrl-7', 'mac': 'Command-7' },
  '₈': { 'win': 'Ctrl-8', 'mac': 'Command-8' },
  '₉': { 'win': 'Ctrl-9', 'mac': 'Command-9' },
  '₀': { 'win': 'Ctrl-0', 'mac': 'Command-0' },
  'ₓ': { 'win': 'Ctrl-x', 'mac': 'Command-x' }
}

const insertSpecialCharacters = Object.entries(characters).map(([key, value]) => (
  {
    name: `insert a special character ${key}`,
    bindKey: value,
    exec: (editor) => { editor.insert(key) }
  }
))

export default insertSpecialCharacters
