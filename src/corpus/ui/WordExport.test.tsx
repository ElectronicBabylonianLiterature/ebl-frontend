import $ from 'jquery'
import WordService from 'dictionary/application/WordService'
import TextService from 'corpus/application/TextService'
import { wordDto } from 'test-support/test-word'
import { wordExport } from 'corpus/ui/WordExport'
import Bluebird from 'bluebird'
import { chapterDisplayFactory } from 'test-support/chapter-fixtures'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { Document } from 'docx'

jest.mock('dictionary/application/WordService')
jest.mock('corpus/application/TextService')

let wordService: jest.Mocked<WordService>
let textService: jest.Mocked<TextService>
let chapter: ChapterDisplay
let wordBlob: Document

beforeEach(async () => {
  wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
  wordService.find.mockReturnValue(Bluebird.resolve(wordDto))
  textService = new (TextService as jest.Mock<jest.Mocked<TextService>>)()

  chapter = chapterDisplayFactory.build()

  wordBlob = await wordExport(
    chapter,
    wordService,
    textService,
    $('#jQueryContainer')
  )
})

test('outputType', () => {
  expect(wordBlob).toBeInstanceOf(Document)
})
