import lineNumberToString from './lineNumberToString'
import { LineNumber, LineNumberRange } from './line-number'

test.each<[string, LineNumber | LineNumberRange]>([
  [
    '999',
    {
      number: 999,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: null,
      type: 'LineNumber',
    },
  ],
  [
    '2′',
    {
      number: 2,
      hasPrime: true,
      prefixModifier: null,
      suffixModifier: null,
      type: 'LineNumber',
    },
  ],
  [
    'a+1',
    {
      number: 1,
      hasPrime: false,
      prefixModifier: 'a',
      suffixModifier: null,
      type: 'LineNumber',
    },
  ],
  [
    '1b',
    {
      number: 1,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: 'b',
      type: 'LineNumber',
    },
  ],
  [
    'Zx+17′Db',
    {
      number: 17,
      hasPrime: true,
      prefixModifier: 'Zx',
      suffixModifier: 'Db',
      type: 'LineNumber',
    },
  ],
  [
    '17–Zx+17′Db',
    {
      start: {
        number: 17,
        hasPrime: false,
        prefixModifier: null,
        suffixModifier: null,
        type: 'LineNumber',
      },
      end: {
        number: 17,
        hasPrime: true,
        prefixModifier: 'Zx',
        suffixModifier: 'Db',
        type: 'LineNumber',
      },
      type: 'LineNumberRange',
    },
  ],
])('%s', (expected, lineNumber) => {
  expect(lineNumberToString(lineNumber)).toEqual(expected)
})
