import { ExtantLine, groupExtantLines } from './extant-lines'

const line1: ExtantLine = {
  lineNumber: {
    number: 1,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
  },
  isSideBoundary: false,
}
const line2: ExtantLine = {
  lineNumber: {
    number: 2,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
  },
  isSideBoundary: false,
}
const line3: ExtantLine = {
  lineNumber: {
    number: 3,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
  },
  isSideBoundary: false,
}
const line4: ExtantLine = {
  lineNumber: {
    number: 4,
    hasPrime: true,
    prefixModifier: null,
    suffixModifier: null,
  },
  isSideBoundary: false,
}

test('groupExtantLines without lines', () => {
  expect(groupExtantLines([])).toEqual([])
})

test('groupExtantLines with one line', () => {
  expect(groupExtantLines([line1])).toEqual([
    {
      start: line1,
    },
  ])
})

test('groupExtantLines', () => {
  expect(groupExtantLines([line1, line2, line3, line4])).toEqual([
    {
      start: line1,
      end: line3,
    },
    {
      start: line4,
    },
  ])
})
