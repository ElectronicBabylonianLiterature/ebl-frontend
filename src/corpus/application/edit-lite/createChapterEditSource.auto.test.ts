import {
  apiOutline,
  createTextServiceMock,
  editChapterId,
  legacyOutline,
  pendingUntilAborted,
  setUpEditProvenances,
  snapshotDto,
} from 'corpus/application/edit-lite/chapterEditSource.testSupport'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import createChapterEditSource, {
  ChapterEditTextService,
} from 'corpus/application/edit-lite/createChapterEditSource'
import { deferred, settle } from 'test-support/concurrencyLimiterHelpers'

const apiError = new Error('Not Found')
const legacyError = new Error('display request failed')

let textService: jest.Mocked<ChapterEditTextService>
let snapshotSignals: (AbortSignal | undefined)[]

function holdSnapshotUntilAborted(): void {
  textService.findChapterAtfSnapshot.mockImplementation((_id, signal) => {
    snapshotSignals.push(signal)
    return pendingUntilAborted(signal)
  })
}

setUpEditProvenances()

beforeEach(() => {
  snapshotSignals = []
  textService = createTextServiceMock()
  textService.findChapterOutline.mockResolvedValue(apiOutline)
  textService.findChapterAtfSnapshot.mockImplementation((_id, signal) => {
    snapshotSignals.push(signal)
    return Promise.resolve(snapshotDto)
  })
})

describe('mode auto', () => {
  it('starts both requests at once', () => {
    textService.findChapterOutline.mockReturnValue(new Promise(() => undefined))
    textService.findChapterAtfSnapshot.mockReturnValue(
      new Promise(() => undefined),
    )

    createChapterEditSource({
      textService,
      id: editChapterId,
      mode: 'auto',
      canWrite: true,
    })

    expect(textService.findChapterOutline).toHaveBeenCalledTimes(1)
    expect(textService.findChapterAtfSnapshot).toHaveBeenCalledTimes(1)
  })

  it('prefers the api and aborts the snapshot request', async () => {
    const outerController = new AbortController()
    holdSnapshotUntilAborted()

    const { source, outline } = await createChapterEditSource({
      textService,
      id: editChapterId,
      mode: 'auto',
      canWrite: true,
      signal: outerController.signal,
    })

    expect(source.kind).toBe('api')
    expect(source.canSave).toBe(true)
    expect(outline).toBe(apiOutline)
    expect(textService.findChapterOutline.mock.calls).toEqual([
      [editChapterId, outerController.signal],
    ])
    expect(snapshotSignals).toHaveLength(1)
    expect(snapshotSignals[0]).toHaveProperty('aborted', true)
    expect(outerController.signal.aborted).toBe(false)
  })

  it('prefers the api even when the snapshot arrived first', async () => {
    const outlineRequest = deferred<ChapterOutline>()
    const onLoaded = jest.fn()
    textService.findChapterOutline.mockReturnValue(outlineRequest.promise)

    const loading = createChapterEditSource({
      textService,
      id: editChapterId,
      mode: 'auto',
      canWrite: false,
    })
    void loading.then(onLoaded)
    await settle()

    expect(snapshotSignals).toHaveLength(1)
    expect(onLoaded).not.toHaveBeenCalled()

    outlineRequest.resolve(apiOutline)
    const { source, outline } = await loading

    expect(source.kind).toBe('api')
    expect(source.canSave).toBe(false)
    expect(outline).toBe(apiOutline)
    expect(snapshotSignals[0]).toHaveProperty('aborted', true)
  })

  it('uses the api when only the snapshot request fails', async () => {
    textService.findChapterAtfSnapshot.mockRejectedValue(legacyError)

    const { source, outline } = await createChapterEditSource({
      textService,
      id: editChapterId,
      mode: 'auto',
      canWrite: true,
    })

    expect(source.kind).toBe('api')
    expect(outline).toBe(apiOutline)
  })

  it('falls back to the snapshot when the outline request fails', async () => {
    textService.findChapterOutline.mockRejectedValue(apiError)

    const { source, outline } = await createChapterEditSource({
      textService,
      id: editChapterId,
      mode: 'auto',
      canWrite: true,
    })

    expect(source.kind).toBe('legacy')
    expect(source.canSave).toBe(false)
    expect(outline).toEqual(legacyOutline)
    expect(snapshotSignals).toHaveLength(1)
    expect(snapshotSignals[0]).toHaveProperty('aborted', false)
    expect(textService.findChapterAtfSnapshot).toHaveBeenCalledTimes(1)
  })

  it('rejects with the snapshot error when both requests fail', async () => {
    textService.findChapterOutline.mockRejectedValue(apiError)
    textService.findChapterAtfSnapshot.mockRejectedValue(legacyError)

    await expect(
      createChapterEditSource({
        textService,
        id: editChapterId,
        mode: 'auto',
        canWrite: true,
      }),
    ).rejects.toBe(legacyError)
  })

  it('aborts the snapshot request when the caller aborts', async () => {
    const outerController = new AbortController()
    textService.findChapterOutline.mockImplementation((_id, signal) =>
      pendingUntilAborted(signal),
    )
    holdSnapshotUntilAborted()

    const loading = createChapterEditSource({
      textService,
      id: editChapterId,
      mode: 'auto',
      canWrite: true,
      signal: outerController.signal,
    })
    outerController.abort()

    await expect(loading).rejects.toHaveProperty('name', 'AbortError')
    expect(snapshotSignals[0]).toHaveProperty('aborted', true)
  })

  it('hands an aborted signal on when the caller aborted before', async () => {
    const outerController = new AbortController()
    outerController.abort()
    textService.findChapterOutline.mockRejectedValue(apiError)

    await createChapterEditSource({
      textService,
      id: editChapterId,
      mode: 'auto',
      canWrite: true,
      signal: outerController.signal,
    })

    expect(snapshotSignals[0]).toHaveProperty('aborted', true)
  })
})
