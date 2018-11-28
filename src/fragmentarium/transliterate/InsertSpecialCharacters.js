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
  'ḫ': { 'win': 'Alt-h', 'mac': 'Option-h' },
  'Ḫ': { 'win': 'Alt-Shift-h', 'mac': 'Option-Shift-h' },
  'ʾ': { 'win': 'Ctrl-Alt-a', 'mac': 'Command-Option-a' },
  'Ĝ': { 'win': 'Alt-Shift-g', 'mac': 'Option-Shift-g' },
  'ĝ': { 'win': 'Alt-g', 'mac': 'Option-g' },
  '₁': { 'win': 'Alt-1', 'mac': 'Option-1' },
  '₂': { 'win': 'Alt-2', 'mac': 'Option-2' },
  '₃': { 'win': 'Alt-3', 'mac': 'Option-3' },
  '₄': { 'win': 'Alt-4', 'mac': 'Option-4' },
  '₅': { 'win': 'Alt-5', 'mac': 'Option-5' },
  '₆': { 'win': 'Alt-6', 'mac': 'Option-6' },
  '₇': { 'win': 'Alt-7', 'mac': 'Option-7' },
  '₈': { 'win': 'Alt-8', 'mac': 'Option-8' },
  '₉': { 'win': 'Alt-9', 'mac': 'Option-9' },
  '₀': { 'win': 'Alt-0', 'mac': 'Option-0' },
  'ₓ': { 'win': 'Alt-x', 'mac': 'Option-x' }
}

const insertSpecialCharacters = Object.entries(characters).map(([key, value]) => (
  {
    name: `insert a special character ${key}`,
    bindKey: value,
    exec: (editor) => { editor.insert(key) }
  }
))

export default insertSpecialCharacters
