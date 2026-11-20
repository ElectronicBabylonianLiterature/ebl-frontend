import {
  createTextServiceMock,
  editChapterId,
  legacyLines,
  legacyOutline,
  setUpEditProvenances,
  snapshotDto,
} from 'corpus/application/edit-lite/chapterEditSource.testSupport'
import {
  ChapterChange,
  ChapterEditSource,
} from 'corpus/application/edit-lite/ChapterEditSource'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { toChapterUpdate } from 'corpus/application/edit-lite/chapterRequests'
import { ChapterEditTextService } from 'corpus/application/edit-lite/createChapterEditSource'
import LegacyChapterEditSource, {
  LegacyChapterEditSource as NamedLegacyChapterEditSource,
  savingNotAvailableMessage,
} from 'corpus/application/edit-lite/LegacyChapterEditSource'
import { toLineEditsDto } from 'corpus/application/edit-lite/lineEdits'
import { Manuscript } from 'corpus/domain/manuscript'

type Apply = (source: ChapterEditSource) => Promise<ChapterOutline>

const manuscripts: readonly Manuscript[] = [new Manuscript({ id: 1 })]
const operations: readonly [string, ChapterChange, Apply][] = [
  [
    'saveLine',
    { type: 'saveLine', index: 1, line: legacyLines[1] },
    (source) => source.saveLine(1, legacyLines[1], legacyLines[1]),
  ],
  [
    'addLine',
    { type: 'addLine', line: legacyLines[0] },
    (source) => source.addLine(legacyLines[0]),
  ],
  [
    'deleteLine',
    { type: 'deleteLine', index: 1 },
    (source) => source.deleteLine(1),
  ],
  [
    'importLines',
    { type: 'importLines', atf: '1. kur' },
    (source) => source.importLines('1. kur'),
  ],
  [
    'saveManuscripts',
    { type: 'saveManuscripts', manuscripts, uncertainFragments: ['K.1'] },
    (source) => source.saveManuscripts(manuscripts, ['K.1']),
  ],
]

let textService: jest.Mocked<ChapterEditTextService>
let source: ChapterEditSource

setUpEditProvenances()

beforeEach(() => {
  textService = createTextServiceMock()
  textService.findChapterAtfSnapshot.mockResolvedValue(snapshotDto)
  source = new LegacyChapterEditSource(textService, editChapterId)
})

it('is exported by name and as default', () => {
  expect(NamedLegacyChapterEditSource).toBe(LegacyChapterEditSource)
})

it('is a read-only legacy source without diagnostics before loading', () => {
  expect(source.kind).toBe('legacy')
  expect(source.canSave).toBe(false)
  expect(source.diagnostics).toEqual([])
  expect(textService.findChapterAtfSnapshot).not.toHaveBeenCalled()
})

it('loads the outline from the ATF snapshot', async () => {
  const signal = new AbortController().signal

  await expect(source.loadOutline(signal)).resolves.toEqual(legacyOutline)
  expect(textService.findChapterAtfSnapshot).toHaveBeenCalledWith(
    editChapterId,
    signal,
  )
})

it.each([
  [0, 1, [0]],
  [1, 1, [1]],
  [0, 2, [0, 1]],
  [0, 10, [0, 1]],
  [1, 0, []],
  [2, 5, []],
])('loads lines from %i with limit %i', async (offset, limit, indices) => {
  await expect(source.loadLines(offset, limit)).resolves.toEqual(
    indices.map((index) => legacyLines[index]),
  )
})

it('requests the snapshot once for the outline and all lines', async () => {
  await Promise.all([
    source.loadOutline(),
    source.loadLines(0, 1),
    source.loadLines(1, 1),
  ])
  await source.loadLines(0, 2)

  expect(textService.findChapterAtfSnapshot).toHaveBeenCalledTimes(1)
})

it('exposes the diagnostics of the loaded snapshot', async () => {
  textService.findChapterAtfSnapshot.mockResolvedValue({
    ...snapshotDto,
    atf: ['1. kur', 'UrkHel9 o 1. kur', 'not a row'].join('\n'),
  })

  await source.loadOutline()

  expect(source.diagnostics).toEqual([
    'Line 1: unrecognised row "not a row"',
    'Unknown siglum "UrkHel9" in 1 manuscript row(s), first in line 1.',
  ])
})

it('retries after a failed request', async () => {
  const error = new Error('display request failed')
  textService.findChapterAtfSnapshot.mockRejectedValueOnce(error)

  await expect(source.loadOutline()).rejects.toBe(error)
  await expect(source.loadLines(0, 1)).resolves.toEqual([legacyLines[0]])
  expect(textService.findChapterAtfSnapshot).toHaveBeenCalledTimes(2)
})

it('describes the request a save would send', () => {
  expect(source.describeSave(1, legacyLines[1])).toEqual(
    toLineEditsDto(1, legacyLines[1]),
  )
  expect(source.describeSave(1, legacyLines[1])).toEqual({
    new: [],
    deleted: [],
    edited: [
      {
        index: 1,
        line: expect.objectContaining({
          number: '2',
          translation: '#tr.en: Nor below\n#tr.ar: translation of the variant',
        }),
      },
    ],
  })
})

it('refuses to save', async () => {
  await expect(
    source.saveLine(0, legacyLines[0], legacyLines[1]),
  ).rejects.toThrow(
    'Saving is not available: this chapter was loaded as a read-only ATF snapshot.',
  )
  expect(textService.updateEditedLines).not.toHaveBeenCalled()
  expect(textService.findChapterAtfSnapshot).not.toHaveBeenCalled()
})

describe.each(operations)('%s', (_name, change, apply) => {
  it('stays a dry run that sends nothing', async () => {
    await expect(apply(source)).rejects.toThrow(savingNotAvailableMessage)

    expect(textService.updateEditedLines).not.toHaveBeenCalled()
    expect(textService.updateChapterOutline).not.toHaveBeenCalled()
    expect(textService.findChapterAtfSnapshot).not.toHaveBeenCalled()
  })

  it('describes the request that would be sent', async () => {
    const { endpoint, body } = toChapterUpdate(change)
    await source.loadOutline()

    expect(source.describeChange(change)).toEqual({
      method: 'POST',
      url: `/texts/L/1/2/chapters/Standard%20Babylonian/I/${endpoint}?view=outline`,
      body,
    })
  })
})
