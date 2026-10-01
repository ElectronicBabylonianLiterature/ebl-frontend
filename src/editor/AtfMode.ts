import { Ace, require as acequire } from 'ace-builds'
import 'ace-builds/src-noconflict/mode-plain_text'

const TextHighlightRules: new () => Ace.HighlightRules = acequire(
  'ace/mode/text_highlight_rules',
).TextHighlightRules
const PlainTextMode: new () => Ace.SyntaxMode = acequire(
  'ace/mode/plain_text',
).Mode

export class AtfHighlightRules extends TextHighlightRules {
  $rules: Ace.HighlightRulesMap

  constructor() {
    super()
    this.$rules = {
      start: [
        {
          token: 'variable.parameter',
          regex: '^@.*$',
        },
        {
          token: 'markup.list',
          regex: '^\\$.*$',
        },
        {
          token: 'comment.line.number-sign',
          regex: '^#.*$',
        },
        {
          token: 'string',
          regex: '[\\[\\]]',
        },
        {
          token: 'string',
          regex: '\\.\\.\\.',
        },
      ],
    }
  }
}

export default class AtfMode extends PlainTextMode {
  HighlightRules: new () => Ace.HighlightRules

  constructor() {
    super()
    this.HighlightRules = AtfHighlightRules
  }
}
