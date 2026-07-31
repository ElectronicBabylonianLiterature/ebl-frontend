import React from 'react'
import Bluebird from 'bluebird'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RealiaSelect from 'fragmentarium/ui/text-annotation/RealiaSelect'
import {
  RealiaOption,
  SEARCH_DEBOUNCE_MS,
} from 'fragmentarium/ui/text-annotation/realiaOptionLoader'
import { realiaEntryFactory } from 'test-support/realia-fixtures'
import {
  mockRealiaSearch,
  realiaServiceMock,
  WithRealiaService,
} from 'fragmentarium/ui/text-annotation/textAnnotation.testSupport'

jest.mock('realia/application/RealiaService')

const entry = realiaEntryFactory.build({
  id: 'Apkallu',
  realiaId: 'realia_000846',
})
const selected: RealiaOption = { value: 'realia_000846', label: 'Apkallu' }
const onChange = jest.fn()

function renderSelect(value: RealiaOption | null = null): {
  unmount: () => void
} {
  const { unmount } = render(
    <WithRealiaService>
      <RealiaSelect ariaLabel={'realia'} value={value} onChange={onChange} />
    </WithRealiaService>,
  )
  return { unmount }
}

const setupUser = () =>
  userEvent.setup({
    advanceTimers: (delay) => jest.advanceTimersByTime(delay),
  })

const advanceDebounce = () =>
  act(() => {
    jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS)
  })

const flushPromises = async (): Promise<void> => {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  jest.useFakeTimers()
  mockRealiaSearch([entry])
})

afterEach(() => {
  jest.useRealTimers()
})

describe('searching', () => {
  it('searches realia entries and reports the realiaId', async () => {
    const user = setupUser()
    renderSelect()
    await user.type(screen.getByLabelText('realia'), 'Apk')
    advanceDebounce()
    await user.click(await screen.findByText('Apkallu'))

    expect(realiaServiceMock.search).toHaveBeenCalledTimes(1)
    expect(realiaServiceMock.search).toHaveBeenCalledWith('Apk')
    expect(onChange).toHaveBeenCalledWith({
      value: 'realia_000846',
      label: 'Apkallu',
      entry,
    })
  })

  it('does not search on an empty query', async () => {
    const user = setupUser()
    renderSelect()
    await user.click(screen.getByLabelText('realia'))
    advanceDebounce()

    expect(realiaServiceMock.search).not.toHaveBeenCalled()
  })
})

describe('when the search fails', () => {
  beforeEach(() => {
    realiaServiceMock.search.mockImplementation(() =>
      Bluebird.reject(new Error('Search failed.')),
    )
  })

  it('clears the loading state and offers no options', async () => {
    const user = setupUser()
    renderSelect()
    await user.type(screen.getByLabelText('realia'), 'Apk')
    advanceDebounce()

    expect(await screen.findByText('No options')).toBeInTheDocument()
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  it('leaves the existing selection intact', async () => {
    const user = setupUser()
    renderSelect(selected)
    await user.type(screen.getByLabelText('realia'), 'Apk')
    advanceDebounce()
    expect(await screen.findByText('No options')).toBeInTheDocument()

    await user.clear(screen.getByLabelText('realia'))

    expect(screen.getByText('Apkallu')).toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('when a request is superseded', () => {
  it('does not let a stale result replace a newer one', async () => {
    const stale = realiaEntryFactory.build({ id: 'Stale', realiaId: 'r_1' })
    let resolveStale: (entries: readonly (typeof stale)[]) => void = () => {}
    realiaServiceMock.search
      .mockReturnValueOnce(
        new Bluebird((resolve) => {
          resolveStale = resolve
        }),
      )
      .mockReturnValueOnce(Bluebird.resolve([entry]))

    const user = setupUser()
    renderSelect()
    await user.type(screen.getByLabelText('realia'), 'Sta')
    advanceDebounce()
    await user.clear(screen.getByLabelText('realia'))
    await user.type(screen.getByLabelText('realia'), 'Apk')
    advanceDebounce()
    await flushPromises()

    expect(await screen.findByText('Apkallu')).toBeInTheDocument()

    await act(async () => {
      resolveStale([stale])
    })
    await flushPromises()

    expect(screen.queryByText('Stale')).not.toBeInTheDocument()
    expect(screen.getByText('Apkallu')).toBeInTheDocument()
  })
})

describe('when unmounted during a request', () => {
  it('updates no state after the request resolves', async () => {
    let resolveSearch: (entries: readonly (typeof entry)[]) => void = () => {}
    realiaServiceMock.search.mockReturnValue(
      new Bluebird((resolve) => {
        resolveSearch = resolve
      }),
    )

    const user = setupUser()
    const { unmount } = renderSelect()
    await user.type(screen.getByLabelText('realia'), 'Apk')
    advanceDebounce()
    unmount()

    await act(async () => {
      resolveSearch([entry])
    })
    await flushPromises()

    expect(screen.queryByText('Apkallu')).not.toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })
})
