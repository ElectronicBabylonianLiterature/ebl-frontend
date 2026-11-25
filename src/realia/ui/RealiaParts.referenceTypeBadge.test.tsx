import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReferenceTypeBadge } from 'realia/ui/RealiaParts'

const afoName = 'AfO-Register Realien'

function setUpBadge(): HTMLElement {
  render(
    <ReferenceTypeBadge referenceType="AfO">
      <span>3</span>
    </ReferenceTypeBadge>,
  )
  return screen
    .getByText('AfO')
    .closest('.Realia__reference-type') as HTMLElement
}

describe('ReferenceTypeBadge', () => {
  it('names the reference type for screen readers', () => {
    const badge = setUpBadge()
    expect(badge).toHaveTextContent(`AfO${afoName}3`)
    expect(screen.getByText('AfO')).toHaveAttribute('aria-hidden', 'true')
  })

  it('shows the full name when reached by keyboard and hides it on leaving', async () => {
    const badge = setUpBadge()
    await userEvent.tab()
    expect(badge).toHaveFocus()
    expect(await screen.findByRole('tooltip')).toHaveTextContent(afoName)
    await userEvent.tab()
    await waitFor(() =>
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument(),
    )
  })

  it('shows the full name on hover', async () => {
    const badge = setUpBadge()
    await userEvent.hover(badge)
    expect(await screen.findByRole('tooltip')).toHaveTextContent(afoName)
  })
})
