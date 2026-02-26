import {
  ImageDollarLine,
  LooseDollarLine,
  RulingDollarLine,
  RulingDollarLineDto,
  SealDollarLine,
  StateDollarLine,
} from 'transliteration/domain/dollar-lines'

export const singleRulingDto: RulingDollarLineDto = {
  prefix: '$',
  content: [
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: ' single ruling',
      value: ' single ruling',
      type: 'ValueToken',
    },
  ],
  number: 'SINGLE',
  status: null,
  displayValue: 'single ruling',
  type: 'RulingDollarLine',
}

export const singleRuling: RulingDollarLine = new RulingDollarLine(
  singleRulingDto,
)

export const doubleRuling: RulingDollarLine = new RulingDollarLine({
  prefix: '$',
  content: [
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: ' double ruling',
      value: ' double ruling',
      type: 'ValueToken',
    },
  ],
  number: 'DOUBLE',
  status: null,
  displayValue: 'double ruling',
  type: 'RulingDollarLine',
})

export const tripleRuling: RulingDollarLine = new RulingDollarLine({
  prefix: '$',
  content: [
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: ' triple ruling',
      value: ' triple ruling',
      type: 'ValueToken',
    },
  ],
  number: 'TRIPLE',
  status: null,
  displayValue: 'triple ruling',
  type: 'RulingDollarLine',
})

export const state: StateDollarLine = new StateDollarLine({
  prefix: '$',
  content: [
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: ' line continues !?',
      value: ' line continues !?',
      type: 'ValueToken',
    },
  ],
  qualification: null,
  extent: null,
  scope: {
    type: 'Scope',
    content: 'LINE',
    text: '',
  },
  state: 'CONTINUES',
  status: 'NEEDS_COLLATION',
  displayValue: 'line continues !?',
  type: 'StateDollarLine',
})

export const image: ImageDollarLine = new ImageDollarLine({
  prefix: '$',
  content: [
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: ' (image 1 = foo)',
      value: ' (image 1 = foo)',
      type: 'ValueToken',
    },
  ],
  number: '1',
  letter: null,
  text: 'foo',
  displayValue: '(image 1 = foo)',
  type: 'ImageDollarLine',
})

export const loose: LooseDollarLine = new LooseDollarLine({
  prefix: '$',
  content: [
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: ' (anything goes)',
      value: ' (anything goes)',
      type: 'ValueToken',
    },
  ],
  text: 'anything goes',
  displayValue: '(anything goes)',
  type: 'LooseDollarLine',
})

export const seal: SealDollarLine = new SealDollarLine({
  prefix: '$',
  content: [
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: ' seal 1',
      value: ' seal 1',
      type: 'ValueToken',
    },
  ],
  number: 1,
  displayValue: 'seal 1',
  type: 'SealDollarLine',
})
