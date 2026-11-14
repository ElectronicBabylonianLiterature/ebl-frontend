import { act, renderHook, RenderHookResult } from '@testing-library/react'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import useFragmentMatchExpansion from 'fragmentarium/ui/search/useFragmentMatchExpansion'
import { QueryItem } from 'query/QueryResult'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  previewLine,
  withPreviewLines,
} from 'test-support/fragment-query-preview'

type ExpansionState = ReturnType<typeof useFragmentMatchExpansion>
type PendingExpansion = {
  result: RenderHookResult<ExpansionState, void>['result']
  unmount: () => void
  find: jest.Mock<Promise<Fragment>, Parameters<FragmentService['find']>>
  fullFragment: Fragment
  resolveRequest: (fragment: Fragment) => void
  rejectRequest: (error: Error) => void
}

function renderPendingExpansion(): PendingExpansion {
  const base = fragmentFactory.build({ hasPhoto: false, dossiers: [] })
  const lines = [previewLine(1, []), previewLine(2, []), previewLine(3, [])]
  const fullFragment = withPreviewLines(base, lines)
  const previewFragment = withPreviewLines(base, lines.slice(0, 2))
  const queryItem: QueryItem = {
    museumNumber: base.number,
    matchingLines: [0, 1, 2],
    matchCount: 3,
  }
  let resolveRequest!: (fragment: Fragment) => void
  let rejectRequest!: (error: Error) => void
  const pendingRequest = new Promise<Fragment>((resolve, reject) => {
    resolveRequest = resolve
    rejectRequest = reject
  })
  const find = jest
    .fn<Promise<Fragment>, Parameters<FragmentService['find']>>()
    .mockReturnValue(pendingRequest)
  const fragmentService: Pick<FragmentService, 'find'> = { find }
  const { result, unmount } = renderHook<ExpansionState, void>(() =>
    useFragmentMatchExpansion({
      fragment: previewFragment,
      queryItem,
      linesToShow: 2,
      fragmentService,
      enableExpansion: true,
    }),
  )
  return { result, unmount, find, fullFragment, resolveRequest, rejectRequest }
}

function expansionCall(fragment: Fragment): unknown[] {
  return [fragment.number, undefined, undefined, expect.any(AbortSignal)]
}

it('reuses a pending request when showMore is invoked after the loading rerender', async () => {
  const { result, find, fullFragment, resolveRequest } =
    renderPendingExpansion()

  expect(result.current.loading).toBe(false)
  expect(result.current.remainingCount).toBeNull()
  expect(find).not.toHaveBeenCalled()
  act(() => result.current.showMore())
  expect(result.current.loading).toBe(true)
  expect(find).toHaveBeenCalledTimes(1)

  act(() => result.current.showMore())
  expect(result.current.loading).toBe(true)
  expect(result.current.expanded).toBe(false)
  expect(find.mock.calls).toEqual([expansionCall(fullFragment)])

  await act(async () => resolveRequest(fullFragment))
  expect(result.current.loading).toBe(false)
  expect(result.current.expanded).toBe(true)
  expect(result.current.selectedIndexes).toEqual([0, 1, 2])
  expect(result.current.remainingCount).toBe(0)
  expect(find.mock.calls).toEqual([expansionCall(fullFragment)])
})

it('ignores a cancelled request rejection and permits a fresh successful request', async () => {
  const { result, find, fullFragment, rejectRequest } = renderPendingExpansion()

  act(() => result.current.showMore())
  expect(result.current.loading).toBe(true)
  act(() => result.current.collapse())
  expect(result.current.loading).toBe(false)
  await act(async () => rejectRequest(new Error('obsolete request')))

  expect(result.current.error).toBe(false)
  expect(result.current.loading).toBe(false)
  expect(result.current.expanded).toBe(false)
  expect(result.current.loadedFragment).toBeNull()
  expect(find).toHaveBeenCalledTimes(1)
  find.mockResolvedValueOnce(fullFragment)
  await act(async () => result.current.showMore())
  expect(result.current.error).toBe(false)
  expect(result.current.expanded).toBe(true)
  expect(result.current.selectedIndexes).toEqual([0, 1, 2])
  expect(find.mock.calls).toEqual([
    expansionCall(fullFragment),
    expansionCall(fullFragment),
  ])
})

function requestSignal(find: PendingExpansion['find'], call = 0): AbortSignal {
  return find.mock.calls[call][3] as AbortSignal
}

it('aborts the in-flight request when loading is cancelled', async () => {
  const { result, find, rejectRequest } = renderPendingExpansion()

  act(() => result.current.showMore())
  expect(requestSignal(find).aborted).toBe(false)
  act(() => result.current.collapse())
  expect(requestSignal(find).aborted).toBe(true)

  await act(async () =>
    rejectRequest(new DOMException('Aborted', 'AbortError')),
  )
  expect(result.current.error).toBe(false)
  expect(result.current.loading).toBe(false)
})

it('aborts the in-flight request on unmount', () => {
  const { result, find, unmount } = renderPendingExpansion()

  act(() => result.current.showMore())
  expect(requestSignal(find).aborted).toBe(false)
  unmount()
  expect(requestSignal(find).aborted).toBe(true)
})

it('reuses the loaded fragment after collapsing a completed request', async () => {
  const { result, find, fullFragment, resolveRequest } =
    renderPendingExpansion()

  act(() => result.current.showMore())
  await act(async () => resolveRequest(fullFragment))
  expect(result.current.expanded).toBe(true)
  act(() => result.current.collapse())

  expect(result.current.loadedFragment).toBe(fullFragment)
  act(() => result.current.showMore())
  expect(result.current.expanded).toBe(true)
  expect(find).toHaveBeenCalledTimes(1)
})
