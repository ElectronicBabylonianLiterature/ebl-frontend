import ApiChapterEditSource from 'corpus/application/edit-lite/ApiChapterEditSource'
import { chapterChangedMessage } from 'corpus/application/edit-lite/chapterChangeMessages'
import { WordInstances } from 'corpus/application/edit-lite/ChapterEditSource'
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
const instances: WordInstances = {
  word: 'kur',
  words: 4,
  lemmatized: 1,
  lines: [0, 3],
  revision: 'revision-1',
}

let textService: jest.Mocked<ChapterEditTextService>
let source: ApiChapterEditSource

beforeEach(() => {
  textService = createTextServiceMock()
  textService.findChapterOutline.mockResolvedValue(apiOutline)
  textService.countWordInstances.mockResolvedValue(instances)
  textService.updateChapterOutline.mockResolvedValue(savedOutline)
  source = new ApiChapterEditSource(textService, editChapterId, true)
})

it('counts the instances of a word at the loaded revision', async () => {
  await source.loadOutline()

  await expect(source.countWordInstances('kur')).resolves.toBe(instances)
  expect(textService.countWordInstances.mock.calls).toEqual([
    [editChapterId, 'kur', 'revision-1'],
  ])
})

it('counts at the revision of the last save without waiting for a running one', async () => {
  await source.loadOutline()
  await source.deleteLine(0)
  textService.updateChapterOutline.mockReturnValue(new Promise(() => null))
  void source.deleteLine(0)

  await expect(source.countWordInstances('kur')).resolves.toBe(instances)
  expect(textService.countWordInstances.mock.calls).toEqual([
    [editChapterId, 'kur', 'revision-2'],
  ])
})

it('rejects the count with the reload message when the chapter has moved on', async () => {
  textService.countWordInstances.mockRejectedValue(
    new ApiError('Conflict', {}, 409),
  )

  await expect(source.countWordInstances('kur')).rejects.toThrow(
    new Error(chapterChangedMessage),
  )
})

it('passes any other error of the count on unchanged', async () => {
  const error = new ApiError('word is required', {}, 422)
  textService.countWordInstances.mockRejectedValue(error)

  await expect(source.countWordInstances('')).rejects.toBe(error)
})

it('sets the lemma of every instance after the saves that were started before', async () => {
  await source.loadOutline()
  const firstSave = source.deleteLine(1)
  const instancesSave = source.lemmatizeWordInstances('kur', ['kur I'])

  await expect(firstSave).resolves.toBe(savedOutline)
  await expect(instancesSave).resolves.toBe(savedOutline)
  expect(textService.updateChapterOutline.mock.calls.slice(1)).toEqual([
    [
      editChapterId,
      'lemmatization/instances',
      { word: 'kur', uniqueLemma: ['kur I'] },
      'revision-2',
    ],
  ])
  expect(source.describeChange({ type: 'deleteLine', index: 0 }).url).toContain(
    'revision=revision-2',
  )
})

it('creates a proper noun in the dictionary', async () => {
  const word = wordFactory.build()
  textService.createDictionaryProperNoun.mockResolvedValue(word)

  await expect(source.createProperNoun('Marduk', 'DN')).resolves.toBe(word)
  expect(textService.createDictionaryProperNoun.mock.calls).toEqual([
    ['Marduk', 'DN'],
  ])
})
