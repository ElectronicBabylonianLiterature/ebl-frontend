import { CompositeAtLine } from 'transliteration/domain/at-lines'

export const composite: CompositeAtLine = new CompositeAtLine({
  prefix: '@',
  content: [
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: 'composite',
      value: 'composite',
      type: 'ValueToken',
    },
  ],
  composite: 'COMPOSITE',
  text: '',
  number: null,
  displayValue: 'composite',
  type: 'CompositeAtLine',
})

export const division: CompositeAtLine = new CompositeAtLine({
  prefix: '@',
  content: [
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: 'div part 1',
      value: 'div part 1',
      type: 'ValueToken',
    },
  ],
  composite: 'DIV',
  text: 'part',
  number: 1,
  displayValue: 'div part 1',
  type: 'CompositeAtLine',
})

export const end: CompositeAtLine = new CompositeAtLine({
  prefix: '@',
  content: [
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: 'end part',
      value: 'end part',
      type: 'ValueToken',
    },
  ],
  composite: 'END',
  text: 'part',
  number: null,
  displayValue: 'end part',
  type: 'CompositeAtLine',
})

export const locator: CompositeAtLine = new CompositeAtLine({
  prefix: '@',
  content: [
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: 'm=locator o 1',
      value: 'm=locator o 1',
      type: 'ValueToken',
    },
  ],
  composite: 'MILESTONE',
  text: 'o',
  number: 1,
  displayValue: 'm=locator o 1',
  type: 'CompositeAtLine',
})
