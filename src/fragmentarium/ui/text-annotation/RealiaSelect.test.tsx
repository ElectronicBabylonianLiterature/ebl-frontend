import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RealiaSelect, {
  loadRealiaOptions,
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
