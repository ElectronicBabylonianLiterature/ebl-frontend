import { ControlLine } from 'transliteration/domain/line'

export const comment: ControlLine = new ControlLine({
  prefix: '#',
  content: [
    {
      value: ' a comment',
      cleanValue: ' a comment',
      enclosureType: [],
      erasure: 'NONE',
      type: 'ValueToken',
    },
  ],
  type: 'ControlLine',
})
