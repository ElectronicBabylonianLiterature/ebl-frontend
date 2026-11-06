import sortFragmentQueryPreviewLines from 'fragmentarium/infrastructure/sortFragmentQueryPreviewLines'
import { FragmentQueryPreviewLineDto } from 'fragmentarium/infrastructure/fragmentQueryMapping'

function ordinaryLine(number: number): FragmentQueryPreviewLineDto {
  return {
    type: 'TextLine',
    prefix: `${number}.`,
    lineNumber: {
      type: 'LineNumber',
      number,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: null,
    },
    content: [],
  }
}

it('retains ordinary indexless preview order and duplicate rows', () => {
  const first = ordinaryLine(7)
  const second = ordinaryLine(3)
  const lines = Object.freeze([first, second, first])

  const sorted = sortFragmentQueryPreviewLines(lines)

  expect(sorted).not.toBe(lines)
  expect(sorted).toHaveLength(3)
  expect(sorted[0]).toBe(first)
  expect(sorted[1]).toBe(second)
  expect(sorted[2]).toBe(first)
  expect(lines).toEqual([first, second, first])
})

it('stably orders safe indexes and preserves optional invalid metadata afterward', () => {
  const missingFirst = ordinaryLine(7)
  const high = { ...ordinaryLine(8), index: 100 }
  const firstDuplicate = { ...ordinaryLine(9), index: 2 }
  const zero = { ...ordinaryLine(10), index: 0 }
  const negative = { ...ordinaryLine(11), index: -1 }
  const secondDuplicate = { ...ordinaryLine(12), index: 2 }
  const fractional = { ...ordinaryLine(13), index: 1.5 }
  const missingSecond = ordinaryLine(14)
  const unsafe = { ...ordinaryLine(15), index: Number.MAX_SAFE_INTEGER + 1 }
  const lines = Object.freeze([
    missingFirst,
    high,
    firstDuplicate,
    zero,
    negative,
    secondDuplicate,
    fractional,
    missingSecond,
    unsafe,
    firstDuplicate,
  ])
  const expected = [
    zero,
    firstDuplicate,
    secondDuplicate,
    firstDuplicate,
    high,
    missingFirst,
    negative,
    fractional,
    missingSecond,
    unsafe,
  ]

  const sorted = sortFragmentQueryPreviewLines(lines)

  expect(sorted).toHaveLength(lines.length)
  expect(sorted).toEqual(expected)
  expected.forEach((line, index) => expect(sorted[index]).toBe(line))
  expect(lines[0]).toBe(missingFirst)
  expect(lines[lines.length - 1]).toBe(firstDuplicate)
})
