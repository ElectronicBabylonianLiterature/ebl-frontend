import SignService from 'signs/application/SignService'
import convertAtfLines from 'signs/ui/CuneiformConverter/convertAtfLines'
import { settle } from 'test-support/concurrencyLimiterHelpers'

jest.mock('signs/application/SignService')

const signServiceMock = new (SignService as jest.Mock<
  jest.Mocked<SignService>
>)()

const reportError = jest.fn()

beforeEach(() => {
  jest.resetAllMocks()
})

it('converts each line in order, keeping blank lines and word separators', async () => {
  signServiceMock.getUnicodeFromAtf
    .mockResolvedValueOnce([{ unicode: [73979] }, { unicode: [9999] }])
    .mockResolvedValueOnce([{ unicode: [74848] }])
  const controller = new AbortController()

  await expect(
    convertAtfLines(signServiceMock, 'A\n\nb', controller.signal, reportError),
  ).resolves.toBe('𒃻 \n\n𒑠')

  expect(signServiceMock.getUnicodeFromAtf).toHaveBeenNthCalledWith(
    1,
    'a',
    controller.signal,
  )
  expect(signServiceMock.getUnicodeFromAtf).toHaveBeenNthCalledWith(
    2,
    'b',
    controller.signal,
  )
  expect(reportError).not.toHaveBeenCalled()
})

it('reports a failed line and leaves it empty', async () => {
  const failure = new Error('query failed')
  signServiceMock.getUnicodeFromAtf
    .mockRejectedValueOnce(failure)
    .mockResolvedValueOnce([{ unicode: [73979] }])

  await expect(
    convertAtfLines(
      signServiceMock,
      'first\nsecond',
      new AbortController().signal,
      reportError,
    ),
  ).resolves.toBe('\n𒃻')
  expect(reportError).toHaveBeenCalledWith(failure)
})

it('rejects with the abort instead of reporting it', async () => {
  const controller = new AbortController()
  signServiceMock.getUnicodeFromAtf.mockImplementation(
    (_line: string, signal?: AbortSignal) =>
      new Promise((_resolve, reject) =>
        signal?.addEventListener('abort', () => reject(signal.reason)),
      ),
  )

  const conversion = convertAtfLines(
    signServiceMock,
    'first',
    controller.signal,
    reportError,
  )
  await settle()
  controller.abort()

  await expect(conversion).rejects.toBe(controller.signal.reason)
  expect(reportError).not.toHaveBeenCalled()
})

it('converts at most four lines at a time', async () => {
  const pending: Array<() => void> = []
  signServiceMock.getUnicodeFromAtf.mockImplementation(
    () =>
      new Promise((resolve) => {
        pending.push(() => resolve([{ unicode: [73979] }]))
      }),
  )

  const conversion = convertAtfLines(
    signServiceMock,
    'a\nb\nc\nd\ne',
    new AbortController().signal,
    reportError,
  )
  await settle()
  expect(signServiceMock.getUnicodeFromAtf).toHaveBeenCalledTimes(4)

  pending.shift()?.()
  await settle()
  expect(signServiceMock.getUnicodeFromAtf).toHaveBeenCalledTimes(5)

  pending.forEach((resolveLine) => resolveLine())
  await expect(conversion).resolves.toBe('𒃻\n𒃻\n𒃻\n𒃻\n𒃻')
})
