import { fromLineDto } from 'corpus/application/dtos'
import ApiChapterEditSource from 'corpus/application/edit-lite/ApiChapterEditSource'
import {
  apiOutline,
  createTextServiceMock,
  editChapterId,
} from 'corpus/application/edit-lite/chapterEditSource.testSupport'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { ChapterEditTextService } from 'corpus/application/edit-lite/createChapterEditSource'
import { EditStatus, Line } from 'corpus/domain/line'
import { deferred, settle } from 'test-support/concurrencyLimiterHelpers'

const lineDto = {
  number: '5',
  oldLineNumbers: [{ number: 'old 5', reference: { id: 'RN1' } }],
  isSecondLineOfParallelism: false,
  isBeginningOfSection: false,
  translation: '#tr.en: They were mingling their waters together',
  variants: [
    {
      reconstruction: '%n mûšunu',
      intertext: '',
      manuscripts: [
        {
          manuscriptId: 1,
          labels: ['o'],
          number: '5',
          atf: 'A-MEŠ-šu₂-nu',
          atfTokens: [{ value: 'A-MEŠ-šu₂-nu', type: 'Word' }],
          omittedWords: [],
        },
      ],
    },
  ],
}

const staleMessage =
  'Line 5 has changed on the server since it was loaded. Reload the chapter and apply your changes again.'
const updatedOutline: ChapterOutline = { ...apiOutline, order: 2 }

let textService: jest.Mocked<ChapterEditTextService>
let source: ApiChapterEditSource
let original: Line
let draft: Line

beforeEach(() => {
  textService = createTextServiceMock()
  textService.findChapterLines.mockImplementation(() =>
    Promise.resolve([fromLineDto(lineDto)]),
  )
  textService.updateEditedLines.mockResolvedValue(updatedOutline)
  source = new ApiChapterEditSource(textService, editChapterId, true)
  original = fromLineDto(lineDto)
  draft = {
    ...original,
    translation: '#tr.en: They mingled their waters',
    status: EditStatus.EDITED,
  }
})

it('describes the request a save would send', () => {
  expect(source.describeSave(4, draft)).toEqual({
    new: [],
    deleted: [],
    edited: [
      {
        index: 4,
        line: {
          number: '5',
          oldLineNumbers: lineDto.oldLineNumbers,
          isSecondLineOfParallelism: false,
          isBeginningOfSection: false,
          translation: '#tr.en: They mingled their waters',
          variants: [
            {
              reconstruction: '%n mûšunu',
              intertext: '',
              manuscripts: [
                {
                  manuscriptId: 1,
                  labels: ['o'],
                  number: '5',
                  atf: 'A-MEŠ-šu₂-nu',
                  omittedWords: [],
                },
              ],
            },
          ],
        },
      },
    ],
  })
})

it('refetches the line, posts the edit and resolves with the new outline', async () => {
  await expect(source.saveLine(4, original, draft)).resolves.toBe(
    updatedOutline,
  )

  expect(textService.findChapterLines.mock.calls).toEqual([
    [editChapterId, 4, 1, undefined, undefined],
  ])
  expect(textService.updateEditedLines.mock.calls).toEqual([
    [editChapterId, source.describeSave(4, draft), undefined],
  ])
})

it('rejects without posting when the line changed on the server', async () => {
  textService.findChapterLines.mockResolvedValueOnce([
    fromLineDto({ ...lineDto, translation: '#tr.en: Edited by somebody else' }),
  ])

  await expect(source.saveLine(4, original, draft)).rejects.toThrow(
    staleMessage,
  )
  expect(textService.updateEditedLines).not.toHaveBeenCalled()
})

it('rejects without posting when the line no longer exists', async () => {
  textService.findChapterLines.mockResolvedValueOnce([])

  await expect(source.saveLine(4, original, draft)).rejects.toThrow(
    staleMessage,
  )
  expect(textService.updateEditedLines).not.toHaveBeenCalled()
})

it('rejects with the request error when the refetch fails', async () => {
  const error = new Error('lines request failed')
  textService.findChapterLines.mockRejectedValueOnce(error)

  await expect(source.saveLine(4, original, draft)).rejects.toBe(error)
  expect(textService.updateEditedLines).not.toHaveBeenCalled()
})

it('rejects with the request error when the post fails', async () => {
  const error = new Error('Invalid manuscript line')
  textService.updateEditedLines.mockRejectedValueOnce(error)

  await expect(source.saveLine(4, original, draft)).rejects.toBe(error)
})

it('refuses to save without write permission and sends nothing', async () => {
  const readOnlySource = new ApiChapterEditSource(
    textService,
    editChapterId,
    false,
  )

  await expect(readOnlySource.saveLine(4, original, draft)).rejects.toThrow(
    'You do not have permission to save changes to this chapter.',
  )
  expect(textService.findChapterLines).not.toHaveBeenCalled()
  expect(textService.updateEditedLines).not.toHaveBeenCalled()
})

it('runs saves one after the other', async () => {
  const firstPost = deferred<ChapterOutline>()
  textService.updateEditedLines.mockReturnValueOnce(firstPost.promise)

  const firstSave = source.saveLine(4, original, draft)
  const secondSave = source.saveLine(9, original, draft)
  await settle()

  expect(textService.findChapterLines.mock.calls).toEqual([
    [editChapterId, 4, 1, undefined, undefined],
  ])
  expect(textService.updateEditedLines).toHaveBeenCalledTimes(1)

  firstPost.resolve(apiOutline)

  await expect(firstSave).resolves.toBe(apiOutline)
  await expect(secondSave).resolves.toBe(updatedOutline)
  expect(textService.findChapterLines.mock.calls).toEqual([
    [editChapterId, 4, 1, undefined, undefined],
    [editChapterId, 9, 1, undefined, apiOutline.revision],
  ])
  expect(textService.updateEditedLines).toHaveBeenCalledTimes(2)
})

it('keeps saving after a failed save', async () => {
  textService.findChapterLines.mockResolvedValueOnce([])

  const failedSave = source.saveLine(4, original, draft)
  const nextSave = source.saveLine(4, original, draft)

  await expect(failedSave).rejects.toThrow(staleMessage)
  await expect(nextSave).resolves.toBe(updatedOutline)
})
