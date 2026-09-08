import FragmentService from 'fragmentarium/application/FragmentService'
import {
  ColophonLoadOptionsMethod,
  ColophonNameOption,
  getLoadOptionsMethod,
} from 'fragmentarium/ui/fragment/colophonNameSuggestions'

jest.mock('fragmentarium/application/FragmentService')

const MockFragmentService = FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>
const debounceMilliseconds = 250

let fragmentService: jest.Mocked<FragmentService>
let callback: jest.Mock<void, [ColophonNameOption[]]>
let loadOptions: ColophonLoadOptionsMethod

beforeEach(() => {
  jest.useFakeTimers()
  fragmentService = new MockFragmentService()
  callback = jest.fn()
  loadOptions = getLoadOptionsMethod(fragmentService)
})

afterEach(() => {
  jest.useRealTimers()
})

async function settle(load: Promise<void>): Promise<void> {
  jest.advanceTimersByTime(debounceMilliseconds)
  await load
}

test('Answers with no options for an input below the minimum length', async () => {
  await loadOptions(' a ', callback)

  expect(callback).toHaveBeenCalledWith([])
  expect(fragmentService.fetchColophonNames).not.toHaveBeenCalled()
})

test('Answers with the fetched names as options', async () => {
  fragmentService.fetchColophonNames.mockResolvedValue(['Nabu', 'Marduk'])

  await settle(loadOptions('  Na  ', callback))

  expect(fragmentService.fetchColophonNames).toHaveBeenCalledWith('Na')
  expect(callback).toHaveBeenCalledWith([
    { value: 'Nabu', label: 'Nabu' },
    { value: 'Marduk', label: 'Marduk' },
  ])
})

test('Answers with no options when the request fails', async () => {
  fragmentService.fetchColophonNames.mockRejectedValue(new Error('failed'))

  await settle(loadOptions('Na', callback))

  expect(callback).toHaveBeenCalledWith([])
})

test('A superseding input cancels the pending request and settles the old one', async () => {
  fragmentService.fetchColophonNames.mockResolvedValue(['Nabu'])

  const superseded = loadOptions('Na', callback)
  const current = loadOptions('Nab', callback)

  await expect(superseded).resolves.toBeUndefined()
  await settle(current)

  expect(fragmentService.fetchColophonNames).toHaveBeenCalledTimes(1)
  expect(fragmentService.fetchColophonNames).toHaveBeenCalledWith('Nab')
})

test('A superseded in-flight request does not answer', async () => {
  let resolveSuperseded: (names: string[]) => void = () => undefined
  fragmentService.fetchColophonNames
    .mockReturnValueOnce(
      new Promise<string[]>((resolve) => {
        resolveSuperseded = resolve
      }),
    )
    .mockResolvedValueOnce(['Current'])

  const superseded = loadOptions('Na', callback)
  jest.advanceTimersByTime(debounceMilliseconds)
  const current = loadOptions('Nab', callback)

  resolveSuperseded(['Superseded'])
  await settle(current)
  await superseded

  expect(callback).toHaveBeenCalledTimes(1)
  expect(callback).toHaveBeenCalledWith([
    { value: 'Current', label: 'Current' },
  ])
})

test('A superseded in-flight failure does not answer', async () => {
  let rejectSuperseded: (error: Error) => void = () => undefined
  fragmentService.fetchColophonNames
    .mockReturnValueOnce(
      new Promise<string[]>((_resolve, reject) => {
        rejectSuperseded = reject
      }),
    )
    .mockResolvedValueOnce(['Current'])

  const superseded = loadOptions('Na', callback)
  jest.advanceTimersByTime(debounceMilliseconds)
  const current = loadOptions('Nab', callback)

  rejectSuperseded(new Error('failed'))
  await settle(current)
  await superseded

  expect(callback).toHaveBeenCalledTimes(1)
  expect(callback).toHaveBeenCalledWith([
    { value: 'Current', label: 'Current' },
  ])
})
