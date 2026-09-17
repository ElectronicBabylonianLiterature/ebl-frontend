import React from 'react'
import { render, screen } from '@testing-library/react'
import { ExcavationSiteField } from 'fragmentarium/ui/fragment/ArchaeologyEditorFields'

test('A site missing from the options is still shown as the selected value', () => {
  render(
    <ExcavationSiteField
      site="Unlisted Site"
      options={[{ value: 'Uruk', label: 'Uruk' }]}
      onChange={jest.fn()}
    />,
  )

  expect(screen.getByText('Unlisted Site')).toBeVisible()
})
