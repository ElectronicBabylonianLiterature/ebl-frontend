import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { saveAs } from 'file-saver'
import MapResearchSummaryActions from './MapResearchSummaryActions'

jest.mock('file-saver', () => ({ saveAs: jest.fn() }))

const buildSummary = jest.fn()

function renderActions(): void {
  render(
    <MapResearchSummaryActions
      title="bB6I Aššur"
      buildSummary={buildSummary}
    />,
  )
}

function mockClipboard(writeText: jest.Mock): void {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  })
}

beforeEach(() => {
  buildSummary.mockReturnValue({
    markdown: '# bB6I — Aššur',
    generatedAt: '2026-08-06T10:00:00.000Z',
  })
})

afterEach(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: undefined,
    configurable: true,
  })
})

describe('copying', () => {
  it('announces a successful copy of the current view', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined)
    mockClipboard(writeText)
    renderActions()

    await userEvent.click(
      screen.getByRole('button', { name: 'Copy research summary' }),
    )

    expect(writeText).toHaveBeenCalledWith('# bB6I — Aššur')
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Research summary copied to clipboard.',
    )
  })

  it('announces a rejected clipboard write', async () => {
    mockClipboard(jest.fn().mockRejectedValue(new Error('denied')))
    renderActions()

    await userEvent.click(
      screen.getByRole('button', { name: 'Copy research summary' }),
    )

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Copying failed. Download the summary instead.',
    )
  })

  it('announces an unavailable clipboard', async () => {
    renderActions()

    await userEvent.click(
      screen.getByRole('button', { name: 'Copy research summary' }),
    )

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Copying failed. Download the summary instead.',
    )
  })
})

describe('downloading', () => {
  it('saves the same markdown under a safe filename', async () => {
    renderActions()

    await userEvent.click(screen.getByRole('button', { name: 'Download .md' }))

    expect(saveAs).toHaveBeenCalledWith(
      expect.any(Blob),
      'ebl-map-bb6i-assur-2026-08-06T10-00-00-000Z.md',
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'Research summary downloaded.',
    )
  })

  it('rebuilds the summary for each action', async () => {
    renderActions()

    await userEvent.click(screen.getByRole('button', { name: 'Download .md' }))
    await userEvent.click(screen.getByRole('button', { name: 'Download .md' }))

    expect(buildSummary).toHaveBeenCalledTimes(2)
  })
})
