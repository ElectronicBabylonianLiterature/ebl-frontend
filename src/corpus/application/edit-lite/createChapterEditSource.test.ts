import ApiChapterEditSource from 'corpus/application/edit-lite/ApiChapterEditSource'
import {
  apiOutline,
  createTextServiceMock,
  editChapterId,
  legacyOutline,
  setUpEditProvenances,
  snapshotDto,
} from 'corpus/application/edit-lite/chapterEditSource.testSupport'
import createChapterEditSource, {
  ChapterEditTextService,
  createChapterEditSource as namedCreateChapterEditSource,
} from 'corpus/application/edit-lite/createChapterEditSource'
import LegacyChapterEditSource from 'corpus/application/edit-lite/LegacyChapterEditSource'

const apiError = new Error('Not Found')
const legacyError = new Error('display request failed')

let textService: jest.Mocked<ChapterEditTextService>

setUpEditProvenances()

beforeEach(() => {
  textService = createTextServiceMock()
  textService.findChapterOutline.mockResolvedValue(apiOutline)
  textService.findChapterAtfSnapshot.mockResolvedValue(snapshotDto)
})

it('is exported by name and as default', () => {
  expect(namedCreateChapterEditSource).toBe(createChapterEditSource)
})

describe('mode api', () => {
  it.each([[true], [false]])(
    'loads only the api outline; can write: %s',
    async (canWrite) => {
      const signal = new AbortController().signal

      const { source, outline } = await createChapterEditSource({
        textService,
        id: editChapterId,
        mode: 'api',
        canWrite,
        signal,
      })

      expect(source).toBeInstanceOf(ApiChapterEditSource)
      expect(source.kind).toBe('api')
      expect(source.canSave).toBe(canWrite)
      expect(outline).toBe(apiOutline)
      expect(textService.findChapterOutline.mock.calls).toEqual([
        [editChapterId, signal],
      ])
      expect(textService.findChapterAtfSnapshot).not.toHaveBeenCalled()
    },
  )

  it('rejects when the outline request fails', async () => {
    textService.findChapterOutline.mockRejectedValue(apiError)

    await expect(
      createChapterEditSource({
        textService,
        id: editChapterId,
        mode: 'api',
        canWrite: true,
      }),
    ).rejects.toBe(apiError)
    expect(textService.findChapterAtfSnapshot).not.toHaveBeenCalled()
  })
})

describe('mode legacy', () => {
  it('loads only the ATF snapshot and never saves', async () => {
    const signal = new AbortController().signal

    const { source, outline } = await createChapterEditSource({
      textService,
      id: editChapterId,
      mode: 'legacy',
      canWrite: true,
      signal,
    })

    expect(source).toBeInstanceOf(LegacyChapterEditSource)
    expect(source.kind).toBe('legacy')
    expect(source.canSave).toBe(false)
    expect(outline).toEqual(legacyOutline)
    expect(textService.findChapterAtfSnapshot.mock.calls).toEqual([
      [editChapterId, signal],
    ])
    expect(textService.findChapterOutline).not.toHaveBeenCalled()
  })

  it('rejects when the snapshot request fails', async () => {
    textService.findChapterAtfSnapshot.mockRejectedValue(legacyError)

    await expect(
      createChapterEditSource({
        textService,
        id: editChapterId,
        mode: 'legacy',
        canWrite: false,
      }),
    ).rejects.toBe(legacyError)
  })
})
