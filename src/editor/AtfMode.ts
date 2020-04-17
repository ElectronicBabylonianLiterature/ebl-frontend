import 'ace-builds/src-noconflict/mode-plain_text'

// @ts-ignore
const acequire = window.ace.acequire

export class AtfHighlightRules extends acequire('ace/mode/text_highlight_rules')
  .TextHighlightRules {
  $rules

  constructor() {
    super()
    this.$rules = {
      /* token values are chosen solely based on color and have no meaning
      This is important when changing the overall theme one could have to
      change tokens too! */
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

export default class AtfMode extends acequire('ace/mode/plain_text').Mode {
  HighlightRules

  constructor() {
    super()
    this.HighlightRules = AtfHighlightRules
  }
}
