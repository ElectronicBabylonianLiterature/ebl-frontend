import 'ace-builds/src-noconflict/mode-plain_text'

// @ts-expect-error - ace is not typed
const acequire = window.ace.acequire

export class AtfHighlightRules
  extends acequire('ace/mode/text_highlight_rules').TextHighlightRules
{
  $rules

  constructor() {
    super()
    this.$rules = {
      /* Token values are chosen based on color in the theme kuroir and not the semantics.
         If a different theme is used, the rules may have to be updated. */
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
