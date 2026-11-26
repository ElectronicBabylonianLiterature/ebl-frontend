import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import referencePopover from 'bibliography/ui/referencePopover'
import Reference from 'bibliography/domain/Reference'
import { referenceFactory } from 'test-support/bibliography-fixtures'

const PopoverCitation = referencePopover(
  ({ reference }: { reference: Reference }) => <>{reference.pages}</>,
)

function showCitation(): HTMLElement {
  const reference = referenceFactory.build({ pages: '482' })
  render(<PopoverCitation reference={reference} />)
  return screen.getByRole('button', { name: '482' })
}

describe('referencePopover', () => {
  it('makes the citation reachable by keyboard', () => {
    const trigger = showCitation()
    expect(trigger).toHaveAttribute('tabindex', '0')
    expect(trigger).not.toHaveAttribute('aria-haspopup')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).not.toHaveAttribute('aria-controls')
  })

  it('links the open full citation to its trigger', async () => {
    const trigger = showCitation()
    fireEvent.keyDown(trigger, { key: 'Enter' })
    const popover = await screen.findByRole('tooltip')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger).toHaveAttribute('aria-controls', popover.id)
  })

  it('keeps the popover id across renders', async () => {
    const trigger = showCitation()
    fireEvent.click(trigger)
    const firstId = (await screen.findByRole('tooltip')).id
    fireEvent.click(trigger)
    fireEvent.click(trigger)
    expect((await screen.findByRole('tooltip')).id).toBe(firstId)
  })

  it.each(['Enter', ' '])('opens the full citation with %p', async (key) => {
    const trigger = showCitation()
    fireEvent.keyDown(trigger, { key })
    expect(await screen.findByRole('tooltip')).toBeInTheDocument()
  })

  it('ignores other keys', () => {
    const trigger = showCitation()
    fireEvent.keyDown(trigger, { key: 'a' })
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })
})
