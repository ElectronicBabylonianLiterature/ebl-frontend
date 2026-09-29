import {
  fromMatchingColophonLinesDto,
  fromMatchingLineDto,
} from 'corpus/application/dtos'
import {
  createLine,
  createManuscriptLine,
  createVariant,
  EditStatus,
} from 'corpus/domain/line'
import { textLineDto } from 'test-support/lines/text-line'
import { TextLine } from 'transliteration/domain/text-line'
import TranslationLine from 'transliteration/domain/translation-line'

const manuscriptLineDto = {
  manuscriptId: 1,
  labels: ['o'],
  number: '1',
  atf: 'kur',
  atfTokens: [],
  omittedWords: [2],
}

const translationDto = {
  language: 'en',
  extent: null,
  parts: [{ text: 'English translation', type: 'StringPart' as const }],
  content: [],
}

test('fromMatchingColophonLinesDto creates text lines for every siglum', () => {
  expect(fromMatchingColophonLinesDto({ NinSchb: [textLineDto] })).toEqual({
    NinSchb: [new TextLine(textLineDto)],
  })
})

test('fromMatchingLineDto creates a clean line with translations', () => {
  const lineDto = {
    number: '1',
    variants: [{ reconstruction: 'kur', manuscripts: [manuscriptLineDto] }],
    translation: [translationDto],
  }

  expect(fromMatchingLineDto(lineDto)).toEqual({
    ...createLine({
      number: '1',
      variants: [
        createVariant({
          reconstruction: 'kur',
          manuscripts: [createManuscriptLine(manuscriptLineDto)],
        }),
      ],
      status: EditStatus.CLEAN,
    }),
    translation: [new TranslationLine(translationDto)],
  })
})

test('fromMatchingLineDto defaults missing variants to an empty list', () => {
  expect(fromMatchingLineDto({ number: '2', translation: [] })).toEqual({
    ...createLine({ number: '2', variants: [], status: EditStatus.CLEAN }),
    translation: [],
  })
})
