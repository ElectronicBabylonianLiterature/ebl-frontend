import { isNext, LineNumber, LineNumberRange } from './line-number'

const testData: [
  LineNumber | LineNumberRange,
  LineNumber | LineNumberRange,
  boolean,
][] = [
  [
    {
      number: 1,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: null,
      type: 'LineNumber',
    },
    {
      number: 2,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: null,
      type: 'LineNumber',
    },
    true,
  ],
  [
    {
      number: 1,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: null,
    },
    {
      number: 2,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: null,
      type: 'LineNumber',
    },
    true,
  ],
  [
    {
      number: 2,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: null,
      type: 'LineNumber',
    },
    {
      number: 1,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: null,
      type: 'LineNumber',
    },
    false,
  ],
  [
    {
      number: 1,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: null,
      type: 'LineNumber',
    },
    {
      number: 2,
      hasPrime: true,
      prefixModifier: null,
      suffixModifier: null,
      type: 'LineNumber',
    },
    false,
  ],
  [
    {
      number: 1,
      hasPrime: false,
      prefixModifier: 'a',
      suffixModifier: null,
      type: 'LineNumber',
    },
    {
      number: 2,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: null,
      type: 'LineNumber',
    },
    false,
  ],
  [
    {
      number: 1,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: null,
      type: 'LineNumber',
    },
    {
      number: 2,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: 'b',
      type: 'LineNumber',
    },
    false,
  ],
  [
    {
      start: {
        number: 1,
        hasPrime: false,
        prefixModifier: null,
        suffixModifier: null,
      },
      end: {
        number: 2,
        hasPrime: false,
        prefixModifier: null,
        suffixModifier: null,
      },
      type: 'LineNumberRange',
    },
    {
      number: 3,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: null,
      type: 'LineNumber',
    },
    true,
  ],
  [
    {
      number: 1,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: null,
      type: 'LineNumber',
    },
    {
      start: {
        number: 2,
        hasPrime: false,
        prefixModifier: null,
        suffixModifier: null,
      },
      end: {
        number: 3,
        hasPrime: false,
        prefixModifier: null,
        suffixModifier: null,
      },
      type: 'LineNumberRange',
    },
    true,
  ],
  [
    {
      number: 2,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: null,
      type: 'LineNumber',
    },
    {
      start: {
        number: 2,
        hasPrime: false,
        prefixModifier: null,
        suffixModifier: null,
      },
      end: {
        number: 3,
        hasPrime: false,
        prefixModifier: null,
        suffixModifier: null,
      },
      type: 'LineNumberRange',
    },
    false,
  ],
  [
    {
      start: {
        number: 1,
        hasPrime: false,
        prefixModifier: null,
        suffixModifier: null,
      },
      end: {
        number: 2,
        hasPrime: false,
        prefixModifier: null,
        suffixModifier: null,
      },
      type: 'LineNumberRange',
    },
    {
      number: 2,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: null,
      type: 'LineNumber',
    },
    false,
  ],
]

test.each(testData)(
  'isNext(%o, %o) is %p',
  (
    first: LineNumber | LineNumberRange,
    second: LineNumber | LineNumberRange,
    expected: boolean,
  ) => {
    expect(isNext(first, second)).toEqual(expected)
  },
)
