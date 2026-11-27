import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EntrySection } from 'common/ui/entry-page/EntrySection'

test('is collapsible by default', async () => {
  const onToggle = jest.fn()
  render(
    <EntrySection id="section" heading="Heading" open onToggle={onToggle}>
      Content
    </EntrySection>,
  )
  const toggle = screen.getByRole('button', { name: 'Heading' })
  expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await userEvent.click(toggle)
  expect(onToggle).toHaveBeenCalledWith('section')
})

test('has a plain heading when it cannot collapse', () => {
  render(
    <EntrySection
      id="section"
      heading="Heading"
      open
      collapsible={false}
      onToggle={jest.fn()}
    >
      Content
    </EntrySection>,
  )
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
  expect(screen.getByRole('region', { name: 'Heading' })).toHaveTextContent(
    'Content',
  )
})
