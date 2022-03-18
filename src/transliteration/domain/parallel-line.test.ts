import _ from 'lodash'
import {
  ParallelComposition,
  ParallelFragment,
  ParallelText,
} from './parallel-line'

const fragmentData = {
  content: [],
  hasCf: false,
  museumNumber: {
    prefix: 'X',
    number: '1',
    suffix: '',
  },
  surface: null,
  lineNumber: {
    number: 4,
    hasPrime: true,
    prefixModifier: '',
    suffixModifier: '',
  },
  hasDuplicates: false,
} as const

const textData = {
  content: [],
  hasCf: true,
  text: {
    genre: 'L',
    category: 1,
    index: 1,
  },
  chapter: {
    stage: 'Old Babylonian',
    version: '',
    name: 'II',
  },
  lineNumber: {
    number: 2,
    hasPrime: false,
    prefixModifier: '',
    suffixModifier: '',
  },
}

const compositionData = {
  content: [],
  hasCf: false,
  name: 'Some Composition',
  lineNumber: {
    number: 1,
    hasPrime: false,
    prefixModifier: '',
    suffixModifier: '',
  },
}

describe.each([
  [fragmentData, new ParallelFragment(fragmentData)],
  [textData, new ParallelText(textData)],
  [compositionData, new ParallelComposition(compositionData)],
])('%p', (data, line) => {
  test.each(_.keys(data))('%s', (property) => {
    expect(line[property]).toEqual(data[property])
  })
})
