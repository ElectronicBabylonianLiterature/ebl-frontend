import React from 'react'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MapResearchSummaryActions from 'map/ui/MapResearchSummaryActions'

const originalClipboard = Object.getOwnPropertyDescriptor(
  navigator,
  'clipboard',
)

afterEach(() => {
  if (originalClipboard) {
    Object.defineProperty(navigator, 'clipboard', originalClipboard)
  } else {
    Reflect.deleteProperty(navigator, 'clipboard')
  }
})

it('ignores a failed copy from the previous area after the current area was copied', async () => {
  let rejectPrevious = (_error: Error): void => undefined
  const previous = new Promise<void>((_resolve, reject) => {
    rejectPrevious = reject
  })
  const writeText = jest
    .fn()
    .mockReturnValueOnce(previous)
    .mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  })
  const oldSummary = (): { markdown: string; generatedAt: string } => ({
    markdown: 'Previous area',
    generatedAt: '2026-11-06T00:00:00Z',
  })
  const currentSummary = (): { markdown: string; generatedAt: string } => ({
    markdown: 'Current area',
    generatedAt: '2026-11-06T00:00:01Z',
  })
  const { rerender } = render(
    <MapResearchSummaryActions
      title="Previous"
      selectionKey="assur:old"
      buildSummary={oldSummary}
    />,
  )
  await userEvent.click(
    screen.getByRole('button', { name: 'Copy research summary' }),
  )
  rerender(
    <MapResearchSummaryActions
      title="Current"
      selectionKey="assur:new"
      buildSummary={currentSummary}
    />,
  )
  await userEvent.click(
    screen.getByRole('button', { name: 'Copy research summary' }),
  )
  expect(
    await screen.findByText('Research summary copied to clipboard.'),
  ).toBeInTheDocument()
  await act(async () => {
    rejectPrevious(new Error('Previous copy failed'))
  })

  expect(
    screen.getByText('Research summary copied to clipboard.'),
  ).toBeInTheDocument()
  expect(
    screen.queryByText('Copying failed. Download the summary instead.'),
  ).not.toBeInTheDocument()
  expect(writeText).toHaveBeenLastCalledWith('Current area')
})
