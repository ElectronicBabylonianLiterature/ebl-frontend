import { act } from '@testing-library/react'
import {
  fragmentService,
  resetAnnotationState,
  setUp,
} from 'fragmentarium/ui/image-annotation/annotation-tool/useFragmentAnnotationState.testSupport'
import { annotations as existingAnnotations } from 'test-support/test-annotation'

type PendingWrite = {
  resolve: () => void
  reject: (error: Error) => void
}

function holdNextWrite(): PendingWrite {
  const pending: PendingWrite = { resolve: jest.fn(), reject: jest.fn() }
  fragmentService.updateAnnotations.mockImplementationOnce(
    () =>
      new Promise((resolve, reject) => {
        pending.resolve = () => resolve(undefined as never)
        pending.reject = reject
      }),
  )
  return pending
}

beforeEach(() => {
  resetAnnotationState()
  window.confirm = jest.fn().mockReturnValue(true)
})

it('keeps the annotations when deleting everything is rejected', async () => {
  const error = new Error('deletion rejected')
  fragmentService.updateAnnotations.mockRejectedValueOnce(error)
  const { result } = setUp()
  act(() => result.current.toggleAutomaticSelection())

  await act(async () => result.current.deleteAllAnnotations())

  expect(result.current.error).toBe(error)
  expect(result.current.isAutomaticSelected).toBe(true)
  expect(result.current.isDeleting).toBe(false)
})

it('resets the tool state once deleting everything succeeds', async () => {
  const { result } = setUp()
  act(() => result.current.toggleAutomaticSelection())

  await act(async () => result.current.deleteAllAnnotations())

  expect(result.current.isAutomaticSelected).toBe(false)
})

it('sends a later write only after the earlier one has settled', async () => {
  const firstWrite = holdNextWrite()
  const { result } = setUp()

  act(() => result.current.saveCurrentAnnotations())
  await act(async () => result.current.deleteAllAnnotations())

  expect(fragmentService.updateAnnotations).toHaveBeenCalledTimes(1)
  expect(result.current.isWriting).toBe(true)

  await act(async () => firstWrite.resolve())

  expect(fragmentService.updateAnnotations).toHaveBeenCalledTimes(2)
  expect(fragmentService.updateAnnotations).toHaveBeenLastCalledWith('K.1', [])
  expect(result.current.isWriting).toBe(false)
})

it('still sends a queued write when the earlier one fails', async () => {
  const error = new Error('save failed')
  const firstWrite = holdNextWrite()
  const { result } = setUp()

  let deletion: Promise<void> = Promise.resolve()
  act(() => result.current.saveCurrentAnnotations())
  await act(async () => {
    deletion = result.current.onDelete(existingAnnotations[0])
  })
  await act(async () => firstWrite.reject(error))

  await expect(deletion).resolves.toBeUndefined()
  expect(fragmentService.updateAnnotations).toHaveBeenCalledTimes(2)
  expect(result.current.error).toBe(error)
})
