import 'brace/mode/java'

// @ts-ignore
const acequire = window.ace.acequire

export class AtfHighlightRules extends acequire('ace/mode/text_highlight_rules')
  .TextHighlightRules {
  $rules

  constructor() {
    super()
    this.$rules = {
      start: [
        {
          token: 'variable.parameter',
          regex: '^@.*$'
        },
        {
          token: 'markup.list',
          regex: '^\\$.*$'
        },
        {
          token: 'comment.line.number-sign',
          regex: '^#.*$'
        },
        {
          token: 'string',
          regex: '[\\[\\]]'
        },
        {
          token: 'string',
          regex: '\\.\\.\\.'
        }
      ]
    }
  }
}

export default class AtfMode extends acequire('ace/mode/java').Mode {
  HighlightRules

  constructor() {
    super()
    this.HighlightRules = AtfHighlightRules
  }
}
