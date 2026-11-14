import { Fragment } from 'fragmentarium/domain/fragment'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  previewLine,
  readingWord,
  valueToken,
} from 'test-support/fragment-query-preview'
import { createTransliteration } from 'transliteration/application/dtos'
import { SealAtLineDto } from 'transliteration/domain/at-lines'
import { Text } from 'transliteration/domain/text'

export const atLineLabelKeys = {
  surface: 'surface_label',
  column: 'column_label',
} as const

export const sealContext = {
  object: { object: 'TABLET', text: '', abbreviation: 'tablet', status: [] },
  surface: { surface: 'OBVERSE', text: '', abbreviation: 'o', status: [] },
  column: { column: 3, abbreviation: 'iii', status: [] },
} as const

export const sealContextMarkers = [
  {
    type: 'ObjectAtLine',
    prefix: '@',
    content: [valueToken('tablet')],
    displayValue: 'tablet',
    label: sealContext.object,
  },
  {
    type: 'SurfaceAtLine',
    prefix: '@',
    content: [valueToken('obverse')],
    displayValue: 'obverse',
    [atLineLabelKeys.surface]: sealContext.surface,
  },
  {
    type: 'ColumnAtLine',
    prefix: '@',
    content: [valueToken('column 3')],
    displayValue: 'column 3',
    [atLineLabelKeys.column]: sealContext.column,
  },
] as const

export function sealMarker(number: number): SealAtLineDto {
  return {
    type: 'SealAtLine',
    prefix: '@',
    number,
    displayValue: `seal ${number}`,
    content: [valueToken(`seal ${number}`)],
  }
}

export function fullSealText(
  sealOnly = false,
  numbers: readonly number[] = [1, 2],
): Text {
  return createTransliteration({
    lines: [
      ...(sealOnly ? [] : sealContextMarkers),
      ...numbers.flatMap((number) => [
        sealMarker(number),
        previewLine(1, [readingWord]),
      ]),
    ],
  })
}

export function explicitSealText(
  sealOnly = false,
  numbers: readonly number[] = [1, 2],
): Text {
  return createTransliteration({
    lines: numbers.map((sealNumber, index) => ({
      ...previewLine(1, [readingWord]),
      index,
      location: {
        object: sealOnly ? null : 'tablet',
        surface: sealOnly ? null : 'o',
        column: sealOnly ? null : 'iii',
        sealNumber,
      },
    })),
  })
}

export function sealFragment(text: Text): Fragment {
  return Fragment.create({ ...fragmentFactory.build(), number: 'BM.123', text })
}
