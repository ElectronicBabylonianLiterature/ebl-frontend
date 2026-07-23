import { saveDateDefault } from './DateSelectionMethods'
import { MesopotamianDate } from 'chronology/domain/Date'
import { Fragment } from 'fragmentarium/domain/fragment'
import { PromiseOperation } from 'common/hooks/usePromiseEffect'

const date = MesopotamianDate.fromJson({
  year: { value: '1' },
  month: { value: '1' },
  day: { value: '1' },
  isSeleucidEra: true,
})
const updatedDate = MesopotamianDate.fromJson({
  year: { value: '2' },
  month: { value: '1' },
  day: { value: '1' },
  isSeleucidEra: true,
})

let setIsSaving: jest.Mock
let setSaveError: jest.Mock
let setDate: jest.Mock
let setIsDisplayed: jest.Mock
let updateDate: jest.Mock
let signal: AbortSignal
let controller: AbortController
let runUpdate: jest.Mock<Promise<void>, [PromiseOperation]>

function save(newDate?: MesopotamianDate): void {
  saveDateDefault({
    date,
    updatedDate: newDate,
    runUpdate,
    setIsSaving,
    setSaveError,
    updateDate,
    setDate,
    setIsDisplayed,
  })
}

beforeEach(() => {
  setIsSaving = jest.fn()
  setSaveError = jest.fn()
  setDate = jest.fn()
  setIsDisplayed = jest.fn()
  updateDate = jest.fn()
  controller = new AbortController()
  signal = controller.signal
  runUpdate = jest.fn((operation: PromiseOperation) =>
    operation(signal).then(() => undefined),
  )
})

it('Does nothing when the date is unchanged', () => {
  save(date)

  expect(runUpdate).not.toHaveBeenCalled()
  expect(setIsSaving).not.toHaveBeenCalled()
  expect(updateDate).not.toHaveBeenCalled()
})

it('Saves and updates the state when the date changed', async () => {
  updateDate.mockReturnValue(Promise.resolve({} as Fragment))
  save(updatedDate)
  await runUpdate.mock.results[0].value

  expect(updateDate).toHaveBeenCalledWith(updatedDate, undefined, signal)
  expect(setIsSaving).toHaveBeenNthCalledWith(1, true)
  expect(setIsSaving).toHaveBeenLastCalledWith(false)
  expect(setIsDisplayed).toHaveBeenCalledWith(false)
  expect(setDate).toHaveBeenCalledWith(updatedDate)
  expect(setSaveError).toHaveBeenCalledWith(null)
})

it('Reports the error when saving fails', async () => {
  const failure = new Error('Saving failed')
  updateDate.mockReturnValue(Promise.reject(failure))
  save(updatedDate)
  await runUpdate.mock.results[0].value

  expect(setSaveError).toHaveBeenLastCalledWith(failure)
  expect(setIsSaving).toHaveBeenLastCalledWith(false)
  expect(setDate).not.toHaveBeenCalled()
})

it('Leaves the state alone when the save was aborted', async () => {
  updateDate.mockImplementation(() => {
    controller.abort()
    return Promise.resolve({} as Fragment)
  })
  save(updatedDate)
  await runUpdate.mock.results[0].value

  expect(setIsDisplayed).not.toHaveBeenCalled()
  expect(setDate).not.toHaveBeenCalled()
  expect(setIsSaving).toHaveBeenCalledTimes(1)
})

it('Leaves the state alone when an aborted save fails', async () => {
  updateDate.mockImplementation(() => {
    controller.abort()
    return Promise.reject(new Error('Saving failed'))
  })
  save(updatedDate)
  await runUpdate.mock.results[0].value

  expect(setSaveError).toHaveBeenCalledTimes(1)
  expect(setSaveError).toHaveBeenCalledWith(null)
  expect(setIsSaving).toHaveBeenCalledTimes(1)
})
