import { createFragment } from 'fragmentarium/infrastructure/fragmentFactories'
import { Fragment } from 'fragmentarium/domain/fragment'
import { fragmentDto } from 'test-support/test-fragment-dto'
import { readingWord, valueToken } from 'test-support/fragment-query-preview'
import { LineBaseDto } from 'transliteration/domain/abstract-line'
import { TextLineDto } from 'transliteration/domain/text-line'
import { SurfaceAtLineDto } from 'transliteration/domain/at-lines'
import { NoteLineDto } from 'transliteration/domain/note-line'

export const legacyMatchingIndexes = [
  100,
  101,
  102,
  103,
  104,
  ...Array.from({ length: 11 }, (_unused, index) => index),
]

function ordinaryLine(sourceIndex: number): TextLineDto {
  return {
    type: 'TextLine',
    prefix: '7.',
    lineNumber: {
      type: 'LineNumber',
      number: 7,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: null,
    },
    content: [readingWord, valueToken(`source-${sourceIndex}`)],
  }
}

export function ordinarySourceLines(): LineBaseDto[] {
  const lines: LineBaseDto[] = Array.from({ length: 105 }, (_unused, index) =>
    ordinaryLine(index),
  )
  const surfaceLabelField = 'surface_label'
  const surface: SurfaceAtLineDto = {
    type: 'SurfaceAtLine',
    prefix: '@',
    content: [],
    displayValue: 'obverse',
    [surfaceLabelField]: {
      surface: 'OBVERSE',
      text: 'obverse',
      abbreviation: 'o',
      status: [],
    },
  }
  const note: NoteLineDto = {
    type: 'NoteLine',
    prefix: '#note: ',
    content: [],
    parts: [],
  }
  lines[49] = surface
  lines[50] = note
  return lines
}

export function ordinaryFragment(lines: readonly LineBaseDto[]): Fragment {
  return createFragment({
    ...fragmentDto,
    museumNumber: { prefix: 'K', number: '1', suffix: '' },
    hasPhoto: false,
    dossiers: [],
    references: [],
    projects: [],
    genres: [],
    date: undefined,
    archaeology: undefined,
    text: { lines },
  })
}
