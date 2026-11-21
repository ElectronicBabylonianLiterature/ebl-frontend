import {
  annotatedLine,
  lineLemmatization,
} from 'corpus/application/edit-lite/annotationFixtures.testSupport'
import ApiChapterEditSource from 'corpus/application/edit-lite/ApiChapterEditSource'
import {
  chapterChangedMessage,
  lineNotReturnedMessage,
} from 'corpus/application/edit-lite/chapterChangeMessages'
import {
  apiOutline,
  createTextServiceMock,
  editChapterId,
} from 'corpus/application/edit-lite/chapterEditSource.testSupport'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { ChapterEditTextService } from 'corpus/application/edit-lite/createChapterEditSource'
import { ApiError } from 'http/ApiClient'
import { wordFactory } from 'test-support/word-fixtures'

const savedOutline: ChapterOutline = { ...apiOutline, revision: 'revision-2' }

let textService: jest.Mocked<ChapterEditTextService>
let source: ApiChapterEditSource

beforeEach(() => {
  textService = createTextServiceMock()
  textService.findChapterOutline.mockResolvedValue(apiOutline)
  textService.findChapterLines.mockResolvedValue([annotatedLine])
  textService.updateChapterOutline.mockResolvedValue(savedOutline)
  source = new ApiChapterEditSource(textService, editChapterId, true)
})

describe('loadAnnotatedLine', () => {
  it('loads the one line with its tokens at the loaded revision', async () => {
    await source.loadOutline()

    await expect(source.loadAnnotatedLine(7)).resolves.toBe(annotatedLine)
    expect(textService.findChapterLines.mock.calls).toEqual([
      [
        editChapterId,
        7,
        1,
        undefined,
        { revision: 'revision-1', tokens: true },
      ],
    ])
  })

  it('asks at the revision of the last save', async () => {
    await source.loadOutline()
    await source.deleteLine(0)
    await source.loadAnnotatedLine(2)

    expect(textService.findChapterLines.mock.calls).toEqual([
      [
        editChapterId,
        2,
        1,
        undefined,
        { revision: 'revision-2', tokens: true },
      ],
    ])
  })

  it('does not ask for tokens when lines are loaded for the text', async () => {
    await source.loadLines(7, 1)

    expect(textService.findChapterLines.mock.calls).toEqual([
      [editChapterId, 7, 1, undefined, undefined],
    ])
  })

  it('rejects with the reload message when the chapter has moved on', async () => {
    textService.findChapterLines.mockRejectedValue(
      new ApiError('Conflict', {}, 409),
    )

    await expect(source.loadAnnotatedLine(0)).rejects.toThrow(
      new Error(chapterChangedMessage),
    )
  })

  it('passes any other error on unchanged', async () => {
    const error = new ApiError('Not Found', {}, 404)
    textService.findChapterLines.mockRejectedValue(error)

    await expect(source.loadAnnotatedLine(0)).rejects.toBe(error)
  })

  it('rejects when the line is not returned', async () => {
    textService.findChapterLines.mockResolvedValue([])

    await expect(source.loadAnnotatedLine(9)).rejects.toThrow(
      new Error(lineNotReturnedMessage),
    )
    expect(lineNotReturnedMessage).toBe(
      'The line was not returned by the data source.',
    )
  })

  it('does not wait for a save that is still running', async () => {
    await source.loadOutline()
    textService.updateChapterOutline.mockReturnValue(new Promise(() => null))
    void source.deleteLine(0)

    await expect(source.loadAnnotatedLine(1)).resolves.toBe(annotatedLine)
  })
})

it('loads the lemmatization of a line from the text service', async () => {
  textService.findLineSuggestions.mockResolvedValue([...lineLemmatization])

  await expect(source.loadLemmatization(annotatedLine)).resolves.toEqual(
    lineLemmatization,
  )
  expect(textService.findLineSuggestions.mock.calls).toEqual([[annotatedLine]])
})

it('searches lemmas in the dictionary', async () => {
  const words = wordFactory.buildList(2)
  textService.searchDictionaryLemma.mockResolvedValue(words)

  await expect(source.searchLemma('kur')).resolves.toBe(words)
  expect(textService.searchDictionaryLemma.mock.calls).toEqual([['kur']])
})
