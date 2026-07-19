import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RealiaSelect, {
  createRealiaOptionLoader,
  loadRealiaOptions,
  RealiaOption,
  toRealiaOption,
} from 'fragmentarium/ui/text-annotation/RealiaSelect'
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
const onChange = jest.fn()

function renderSelect(): void {
  render(
    <WithRealiaService>
      <RealiaSelect ariaLabel={'realia'} value={null} onChange={onChange} />
    </WithRealiaService>,
  )
}

describe('toRealiaOption', () => {
  it('uses the realiaId as value and the lemma as label, keeping the entry', () => {
    expect(toRealiaOption(entry)).toEqual({
      value: 'realia_000846',
      label: 'Apkallu',
      entry,
    })
  })
})

describe('loadRealiaOptions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRealiaSearch([entry])
  })

  it('maps search results to options', async () => {
    await expect(loadRealiaOptions(realiaServiceMock, 'Apk')).resolves.toEqual([
      { value: 'realia_000846', label: 'Apkallu', entry },
    ])
    expect(realiaServiceMock.search).toHaveBeenCalledWith('Apk')
  })

  it('does not search on an empty query', async () => {
    await expect(loadRealiaOptions(realiaServiceMock, '')).resolves.toEqual([])
    expect(realiaServiceMock.search).not.toHaveBeenCalled()
  })
})

describe('RealiaSelect', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRealiaSearch([entry])
  })

  it('searches realia entries and reports the realiaId', async () => {
    renderSelect()
    await userEvent.type(screen.getByLabelText('realia'), 'Apk')
    await userEvent.click(await screen.findByText('Apkallu'))

    expect(realiaServiceMock.search).toHaveBeenCalledWith('Apk')
    expect(onChange).toHaveBeenCalledWith({
      value: 'realia_000846',
      label: 'Apkallu',
      entry,
    })
  })

  it('does not search on an empty query', async () => {
    renderSelect()
    await userEvent.click(screen.getByLabelText('realia'))

    expect(realiaServiceMock.search).not.toHaveBeenCalled()
  })
})

describe('createRealiaOptionLoader', () => {
  const getContext = () => ({
    realiaService: realiaServiceMock,
    excludedRealiaIds: [] as readonly string[],
  })

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    mockRealiaSearch([entry])
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('debounces rapid queries into a single search of the latest input', () => {
    const load = createRealiaOptionLoader(getContext, 300)
    const callback = jest.fn()

    load('A', callback)
    load('Ap', callback)
    load('Apk', callback)
    expect(realiaServiceMock.search).not.toHaveBeenCalled()

    jest.advanceTimersByTime(300)

    expect(realiaServiceMock.search).toHaveBeenCalledTimes(1)
    expect(realiaServiceMock.search).toHaveBeenCalledWith('Apk')
  })

  it('returns empty and does not search on an empty query', () => {
    const load = createRealiaOptionLoader(getContext, 300)
    const callback = jest.fn<void, [RealiaOption[]]>()

    load('', callback)

    expect(callback).toHaveBeenCalledWith([])
    expect(realiaServiceMock.search).not.toHaveBeenCalled()
  })

  it('cancels a pending search', () => {
    const load = createRealiaOptionLoader(getContext, 300)

    load('Apk', jest.fn())
    load.cancel()
    jest.advanceTimersByTime(300)

    expect(realiaServiceMock.search).not.toHaveBeenCalled()
  })
})

describe('loadRealiaOptions exclusions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRealiaSearch([entry])
  })

  it('omits realia that are already annotated on the span', async () => {
    await expect(
      loadRealiaOptions(realiaServiceMock, 'Apk', ['realia_000846']),
    ).resolves.toEqual([])
  })

  it('keeps realia that are not excluded', async () => {
    await expect(
      loadRealiaOptions(realiaServiceMock, 'Apk', ['realia_000999']),
    ).resolves.toEqual([{ value: 'realia_000846', label: 'Apkallu', entry }])
  })
})
