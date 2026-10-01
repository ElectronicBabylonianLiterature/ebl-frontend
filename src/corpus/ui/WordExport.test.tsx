import $ from 'jquery'
import WordService from 'dictionary/application/WordService'
import TextService from 'corpus/application/TextService'
import { RowsContextService } from 'corpus/ui/RowsContext'
import { TranslationContextService } from 'corpus/ui/TranslationContext'
import { wordDto } from 'test-support/test-word'
import { wordExport } from 'corpus/ui/WordExport'
import { chapterDisplayFactory } from 'test-support/chapter-fixtures'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { Document, Packer } from 'docx'
import JSZip from 'jszip'
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

async function exportChapter(exported: ChapterDisplay): Promise<Document> {
  let document = new Document()
  await act(async () => {
    document = await wordExport(
      exported,
      {
        wordService: wordService,
        textService: textService,
        rowsContext: rowsContext,
        translationContext: translationContext,
      },
      $('#jQueryContainer'),
    )
  })
  return document
}

async function documentXml(document: Document): Promise<string> {
  const zip = await JSZip.loadAsync(await Packer.toBuffer(document))
  return (await zip.file('word/document.xml')?.async('string')) ?? ''
}

beforeEach(async () => {
  chapter = chapterDisplayFactory.build()
  wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
  wordService.find.mockReturnValue(Promise.resolve(wordDto))
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

  wordBlob = await exportChapter(chapter)
})

test('outputType', () => {
  expect(wordBlob).toBeInstanceOf(Document)
})

test('heads the document with the stage and the text name', async () => {
  const xml = await documentXml(
    await exportChapter(
      chapterDisplayFactory.build({
        isSingleStage: false,
        textName: 'Poem of Erra',
      }),
    ),
  )

  expect(xml).toContain('Poem of Erra')
})

test('heads a single stage chapter without text name with its title only', async () => {
  const exported = chapterDisplayFactory.build({
    isSingleStage: true,
    textName: '-',
  })
  const xml = await documentXml(await exportChapter(exported))

  expect(xml).not.toContain(exported.id.stage)
  expect(xml).toContain('Chapter')
})

test('omits the edition of a chapter without lines', async () => {
  const withLines = await documentXml(wordBlob)
  const withoutLines = await documentXml(
    await exportChapter(chapterDisplayFactory.build({ lines: [] })),
  )

  expect(withLines).toContain('Edition')
  expect(withoutLines).not.toContain('Edition')
})
