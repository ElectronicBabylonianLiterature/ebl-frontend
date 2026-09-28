import React from 'react'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { saveAs } from 'file-saver'
import MapResearchSummaryActions from 'map/MapResearchSummaryActions'

jest.mock('file-saver', () => ({ saveAs: jest.fn() }))

const buildSummary = jest.fn()

interface Deferred {
  readonly promise: Promise<void>
  readonly resolve: () => void
  readonly reject: (error: Error) => void
}

function deferred(): Deferred {
  let resolve = (): void => undefined
  let reject = (_error: Error): void => undefined
  const promise = new Promise<void>((onResolve, onReject) => {
    resolve = onResolve
    reject = onReject
  })
  return { promise, resolve, reject }
}

function renderActions(title = 'bB6I Aššur', selectionKey = 'assur:area-a') {
  return render(
    <MapResearchSummaryActions
      title={title}
      selectionKey={selectionKey}
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
  jest.clearAllMocks()
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
  it('announces copying and then a successful copy', async () => {
    const pending = deferred()
    const writeText = jest.fn().mockReturnValue(pending.promise)
    mockClipboard(writeText)
    renderActions()

    await userEvent.click(
      screen.getByRole('button', { name: 'Copy research summary' }),
    )

    expect(screen.getByText('Copying research summary…')).toHaveAttribute(
      'aria-live',
      'polite',
    )
    expect(screen.getByTestId('research-summary-status')).toHaveAttribute(
      'aria-atomic',
      'true',
    )
    await act(async () => pending.resolve())
    expect(
      screen.getByText('Research summary copied to clipboard.'),
    ).toBeInTheDocument()
    expect(writeText).toHaveBeenCalledWith('# bB6I — Aššur')
  })

  it('announces a rejected or unavailable clipboard', async () => {
    mockClipboard(jest.fn().mockRejectedValue(new Error('denied')))
    const { rerender } = renderActions()
    await userEvent.click(
      screen.getByRole('button', { name: 'Copy research summary' }),
    )
    expect(
      await screen.findByText('Copying failed. Download the summary instead.'),
    ).toBeInTheDocument()

    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
    })
    rerender(
      <MapResearchSummaryActions
        title="new title"
        selectionKey="new-selection"
        buildSummary={buildSummary}
      />,
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Copy research summary' }),
    )
    expect(
      await screen.findByText('Copying failed. Download the summary instead.'),
    ).toBeInTheDocument()
  })

  it('keeps the result of the latest copy attempt', async () => {
    const first = deferred()
    const second = deferred()
    mockClipboard(
      jest
        .fn()
        .mockReturnValueOnce(first.promise)
        .mockReturnValueOnce(second.promise),
    )
    renderActions()

    await userEvent.click(
      screen.getByRole('button', { name: 'Copy research summary' }),
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Copy research summary' }),
    )
    await act(async () => second.reject(new Error('latest failed')))
    expect(
      screen.getByText('Copying failed. Download the summary instead.'),
    ).toBeInTheDocument()

    await act(async () => first.resolve())
    expect(
      screen.getByText('Copying failed. Download the summary instead.'),
    ).toBeInTheDocument()
  })

  it('invalidates a pending copy when summary content changes', async () => {
    const pending = deferred()
    mockClipboard(jest.fn().mockReturnValue(pending.promise))
    const { rerender } = renderActions()
    await userEvent.click(
      screen.getByRole('button', { name: 'Copy research summary' }),
    )

    const updatedSummary = jest.fn(() => ({
      markdown: '# updated context',
      generatedAt: '2026-08-06T10:01:00.000Z',
    }))
    rerender(
      <MapResearchSummaryActions
        title="bB6I Aššur"
        selectionKey="assur:area-a"
        buildSummary={updatedSummary}
      />,
    )
    await act(async () => pending.resolve())

    expect(screen.getByTestId('research-summary-status')).toBeEmptyDOMElement()
  })

  it.each([
    ['title', 'new title', 'assur:area-a'],
    ['selection', 'bB6I Aššur', 'assur:area-b'],
  ])(
    'invalidates a pending copy when the %s changes',
    async (_change, title, selectionKey) => {
      const pending = deferred()
      mockClipboard(jest.fn().mockReturnValue(pending.promise))
      const { rerender } = renderActions()
      await userEvent.click(
        screen.getByRole('button', { name: 'Copy research summary' }),
      )

      rerender(
        <MapResearchSummaryActions
          title={title}
          selectionKey={selectionKey}
          buildSummary={buildSummary}
        />,
      )
      await act(async () => pending.resolve())
      expect(
        screen.getByTestId('research-summary-status'),
      ).toBeEmptyDOMElement()
    },
  )
})

describe('downloading', () => {
  it('invalidates a pending copy and saves current markdown safely', async () => {
    const pending = deferred()
    mockClipboard(jest.fn().mockReturnValue(pending.promise))
    renderActions()
    await userEvent.click(
      screen.getByRole('button', { name: 'Copy research summary' }),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Download .md' }))

    expect(saveAs).toHaveBeenCalledWith(
      expect.any(Blob),
      'ebl-map-bb6i-assur-2026-08-06T10-00-00-000Z.md',
    )
    expect(screen.getByText('Research summary downloaded.')).toBeInTheDocument()
    await act(async () => pending.resolve())
    expect(screen.getByText('Research summary downloaded.')).toBeInTheDocument()
  })

  it('rebuilds the summary for each action', async () => {
    renderActions()
    await userEvent.click(screen.getByRole('button', { name: 'Download .md' }))
    await userEvent.click(screen.getByRole('button', { name: 'Download .md' }))
    expect(buildSummary).toHaveBeenCalledTimes(2)
  })
})
