import { chapterChangedMessage } from 'corpus/application/edit-lite/chapterChangeMessages'
import {
  readAtCurrentRevision,
  readAtOneRevision,
  rejectRevisionConflict,
  RevisionTracked,
  trackRevision,
} from 'corpus/application/edit-lite/revisionReads'
import { ApiError } from 'http/ApiClient'

const conflict = new ApiError('Conflict', {}, 409)

let revision: string | undefined
let writesSettled: jest.Mock<Promise<void>, []>

beforeEach(() => {
  revision = 'revision-1'
  writesSettled = jest.fn(() => Promise.resolve())
})

function readAtRevision(
  read: jest.Mock<Promise<string>, [string | undefined]>,
): Promise<string> {
  return readAtCurrentRevision(read, () => revision, writesSettled)
}

it('reads with the current revision', async () => {
  const read = jest.fn().mockResolvedValue('lines')

  await expect(readAtRevision(read)).resolves.toBe('lines')
  expect(read).toHaveBeenCalledWith('revision-1')
  expect(writesSettled).not.toHaveBeenCalled()
})

it('passes errors other than a conflict through', async () => {
  const error = new ApiError('Not Found', {}, 404)
  const read = jest.fn().mockRejectedValue(error)

  await expect(readAtRevision(read)).rejects.toBe(error)
  expect(writesSettled).not.toHaveBeenCalled()
})

it('retries a conflicting read with the revision of writes that settled meanwhile', async () => {
  const read = jest
    .fn()
    .mockRejectedValueOnce(conflict)
    .mockResolvedValue('lines')
  writesSettled.mockImplementation(() => {
    revision = 'revision-2'
    return Promise.resolve()
  })

  await expect(readAtRevision(read)).resolves.toBe('lines')
  expect(read.mock.calls).toEqual([['revision-1'], ['revision-2']])
})

it('reports a changed chapter when no write moved the revision', async () => {
  const read = jest.fn().mockRejectedValue(conflict)

  await expect(readAtRevision(read)).rejects.toThrow(chapterChangedMessage)
  expect(writesSettled).toHaveBeenCalledTimes(1)
  expect(read).toHaveBeenCalledTimes(1)
})

it('reports a changed chapter when the retried read conflicts again', async () => {
  const read = jest.fn().mockRejectedValue(conflict)
  writesSettled.mockImplementation(() => {
    revision = 'revision-2'
    return Promise.resolve()
  })

  await expect(readAtRevision(read)).rejects.toThrow(chapterChangedMessage)
  expect(read).toHaveBeenCalledTimes(2)
})

it('keeps errors other than a conflict when rejecting', () => {
  const error = new Error('offline')

  expect(() => rejectRevisionConflict(error)).toThrow(error)
  expect(() => rejectRevisionConflict(conflict)).toThrow(chapterChangedMessage)
})

it('stops waiting for writes when the read is aborted', async () => {
  const controller = new AbortController()
  const read = jest.fn().mockRejectedValue(conflict)
  writesSettled.mockReturnValue(new Promise(() => undefined))

  const result = readAtCurrentRevision(
    read,
    () => revision,
    writesSettled,
    controller.signal,
  )
  await new Promise((resolve) => setTimeout(resolve, 0))
  expect(writesSettled).toHaveBeenCalledTimes(1)
  controller.abort()

  await expect(result).rejects.toMatchObject({ name: 'AbortError' })
  expect(read).toHaveBeenCalledTimes(1)
})

it('does not wait for writes when the read was aborted already', async () => {
  const controller = new AbortController()
  controller.abort()
  const read = jest.fn().mockRejectedValue(conflict)

  await expect(
    readAtCurrentRevision(
      read,
      () => revision,
      writesSettled,
      controller.signal,
    ),
  ).rejects.toMatchObject({ name: 'AbortError' })
  expect(writesSettled).not.toHaveBeenCalled()
})

it('retries after the writes settled while a signal is given', async () => {
  const read = jest
    .fn()
    .mockRejectedValueOnce(conflict)
    .mockResolvedValue('lines')
  writesSettled.mockImplementation(() => {
    revision = 'revision-2'
    return Promise.resolve()
  })

  await expect(
    readAtCurrentRevision(
      read,
      () => revision,
      writesSettled,
      new AbortController().signal,
    ),
  ).resolves.toBe('lines')
})

it('records the revision a read was made at', async () => {
  const read = jest.fn().mockResolvedValue('lines')

  await expect(trackRevision(read)('revision-1')).resolves.toEqual({
    revision: 'revision-1',
    result: 'lines',
  })
})

function tracked(...revisions: string[]): readonly RevisionTracked<string>[] {
  return revisions.map((partRevision, index) => ({
    revision: partRevision,
    result: `part ${index}`,
  }))
}

it('keeps parts that were read at one revision', async () => {
  const readAll = jest.fn().mockResolvedValue(tracked('r1', 'r1'))

  await expect(readAtOneRevision(readAll)).resolves.toEqual([
    'part 0',
    'part 1',
  ])
  expect(readAll).toHaveBeenCalledTimes(1)
})

it('reads all parts again when they were read at different revisions', async () => {
  const readAll = jest
    .fn()
    .mockResolvedValueOnce(tracked('r1', 'r2'))
    .mockResolvedValueOnce(tracked('r2', 'r2'))

  await expect(readAtOneRevision(readAll)).resolves.toEqual([
    'part 0',
    'part 1',
  ])
  expect(readAll).toHaveBeenCalledTimes(2)
})
