import 'brace/mode/java'

export class AtfHighlightRules extends window.ace.acequire(
  'ace/mode/text_highlight_rules'
).TextHighlightRules {
  constructor() {
    super()
    this.$rules = {
      start: [
        {
          token: 'comment',
          regex: '^@.*$'
        },
        {
          token: 'constant.language.boolean',
          regex: '^\\$.*$'
        },
        {
          token: 'constant.numeric',
          regex: '^#.*$'
        },
        {
          token: 'string',
          regex: '\\|[^\\|]*\\|'
        },
        {
          token: 'support.function',
          regex: '\\[[^\\[]*\\]'
        }
      ]
    }
  }
}

export default class AtfMode extends window.ace.acequire('ace/mode/java').Mode {
  constructor() {
    super()
    this.HighlightRules = AtfHighlightRules
  }
}
