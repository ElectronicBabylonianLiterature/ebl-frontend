import _ from 'lodash'
import { isAbortError } from 'common/utils/abortError'
import ApiChapterEditSource, {
  ApiChapterEditSource as NamedApiChapterEditSource,
  maximumConcurrentLineRequests,
  maximumLinesPerRequest,
} from 'corpus/application/edit-lite/ApiChapterEditSource'
import {
  apiOutline,
  createTextServiceMock,
  editChapterId,
} from 'corpus/application/edit-lite/chapterEditSource.testSupport'
import { ChapterEditTextService } from 'corpus/application/edit-lite/createChapterEditSource'
import { createLine, Line } from 'corpus/domain/line'
import { deferred, settle } from 'test-support/concurrencyLimiterHelpers'

let textService: jest.Mocked<ChapterEditTextService>
let source: ApiChapterEditSource

function lineAt(index: number): Line {
  return createLine({ number: `${index + 1}` })
}

function linesIn(offset: number, limit: number): Line[] {
  return _.range(offset, offset + limit).map(lineAt)
}

function requestedRanges(): number[][] {
  return textService.findChapterLines.mock.calls.map(([, offset, limit]) => [
    offset,
    limit,
  ])
}

beforeEach(() => {
  textService = createTextServiceMock()
  textService.findChapterLines.mockImplementation((_id, offset, limit) =>
    Promise.resolve(linesIn(offset, limit)),
  )
  source = new ApiChapterEditSource(textService, editChapterId, true)
})

it('is exported by name and as default', () => {
  expect(NamedApiChapterEditSource).toBe(ApiChapterEditSource)
  expect(maximumLinesPerRequest).toBe(10)
  expect(maximumConcurrentLineRequests).toBe(3)
})

it('loads the outline from the outline endpoint', async () => {
  const signal = new AbortController().signal
  textService.findChapterOutline.mockResolvedValue(apiOutline)

  await expect(source.loadOutline(signal)).resolves.toBe(apiOutline)
  expect(textService.findChapterOutline).toHaveBeenCalledWith(
    editChapterId,
    signal,
  )
})

describe('loadLines', () => {
  it('loads up to ten lines with one request', async () => {
    const signal = new AbortController().signal

    await expect(source.loadLines(3, 10, signal)).resolves.toEqual(
      linesIn(3, 10),
    )
    expect(textService.findChapterLines.mock.calls).toEqual([
      [editChapterId, 3, 10, signal, { revision: undefined }],
    ])
  })

  it('splits a longer range into requests of at most ten lines', async () => {
    await expect(source.loadLines(5, 25)).resolves.toEqual(linesIn(5, 25))
    expect(requestedRanges()).toEqual([
      [5, 10],
      [15, 10],
      [25, 5],
    ])
  })

  it.each([[0], [-3]])('requests nothing for the limit %i', async (limit) => {
    await expect(source.loadLines(7, limit)).resolves.toEqual([])
    expect(textService.findChapterLines).not.toHaveBeenCalled()
  })

  it('keeps the line order when later requests answer first', async () => {
    const first = deferred<readonly Line[]>()
    const second = deferred<readonly Line[]>()
    textService.findChapterLines
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)

    const lines = source.loadLines(0, 20)
    second.resolve(linesIn(10, 10))
    await settle()
    first.resolve(linesIn(0, 10))

    await expect(lines).resolves.toEqual(linesIn(0, 20))
  })

  it('keeps at most three requests in flight', async () => {
    const responses = _.times(5, () => deferred<readonly Line[]>())
    responses.forEach((response) =>
      textService.findChapterLines.mockReturnValueOnce(response.promise),
    )

    const lines = source.loadLines(0, 45)
    await settle()
    expect(requestedRanges()).toEqual([
      [0, 10],
      [10, 10],
      [20, 10],
    ])

    responses[1].resolve(linesIn(10, 10))
    await settle()
    expect(requestedRanges()).toHaveLength(4)

    responses.forEach((response, index) =>
      response.resolve(linesIn(index * 10, index === 4 ? 5 : 10)),
    )
    await expect(lines).resolves.toEqual(linesIn(0, 45))
    expect(requestedRanges()[4]).toEqual([40, 5])
  })

  it('shares the three slots between overlapping loads', async () => {
    textService.findChapterLines.mockReturnValue(new Promise(() => undefined))

    source.loadLines(0, 20)
    source.loadLines(20, 20)
    await settle()

    expect(requestedRanges()).toHaveLength(3)
  })

  it('rejects when one request fails', async () => {
    const error = new Error('lines request failed')
    textService.findChapterLines.mockRejectedValueOnce(error)

    await expect(source.loadLines(0, 20)).rejects.toBe(error)
  })

  it('requests nothing when the signal is already aborted', async () => {
    const controller = new AbortController()
    controller.abort()

    const failure = await source
      .loadLines(0, 20, controller.signal)
      .catch((error: unknown) => error)

    expect(isAbortError(failure)).toBe(true)
    expect(textService.findChapterLines).not.toHaveBeenCalled()
  })
})
