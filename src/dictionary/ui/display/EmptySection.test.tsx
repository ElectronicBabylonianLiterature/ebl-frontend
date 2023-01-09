import React from 'react'
import { render, screen } from '@testing-library/react'
import { EmptySection } from 'dictionary/ui/display/EmptySection'

test('EmptySection', () => {
  render(<EmptySection />)
  expect(screen.getByText('No entries')).toBeVisible()
})
