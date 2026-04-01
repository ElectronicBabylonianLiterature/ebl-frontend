import $ from 'jquery'
import WordService from 'dictionary/application/WordService'
import TextService from 'corpus/application/TextService'
import { RowsContextService } from 'corpus/ui/RowsContext'
import { TranslationContextService } from 'corpus/ui/TranslationContext'
import { wordDto } from 'test-support/test-word'
import { wordExport } from 'corpus/ui/WordExport'
import Bluebird from 'bluebird'
import { chapterDisplayFactory } from 'test-support/chapter-fixtures'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { Document } from 'docx'
import { act } from '@testing-library/react'

jest.mock('dictionary/application/WordService')
jest.mock('corpus/application/TextService')
jest.mock('corpus/ui/RowsContext')
jest.mock('corpus/ui/TranslationContext')

let wordService: jest.Mocked<WordService>
let textService: jest.Mocked<TextService>
let rowsContext: jest.Mocked<RowsContextService>
let translationContext: jest.Mocked<TranslationContextService>

let chapter: ChapterDisplay
let wordBlob: Document

beforeEach(async () => {
  chapter = chapterDisplayFactory.build()
  wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
  wordService.find.mockReturnValue(Bluebird.resolve(wordDto))
  textService = new (TextService as jest.Mock<jest.Mocked<TextService>>)()
  rowsContext = [
    Object.fromEntries(
      chapter.lines.map((line, i) => [
        i,
        {
          score: true,
          notes: true,
          parallels: true,
          oldLineNumbers: true,
          meter: true,
          ipa: true,
        },
      ]),
    ),
    jest.fn(),
  ]
  translationContext = [{ language: 'en' }, jest.fn()]

  await act(async () => {
    wordBlob = await wordExport(
      chapter,
      {
        wordService: wordService,
        textService: textService,
        rowsContext: rowsContext,
        translationContext: translationContext,
      },
      $('#jQueryContainer'),
    )
  })
})

test('outputType', () => {
  expect(wordBlob).toBeInstanceOf(Document)
})
