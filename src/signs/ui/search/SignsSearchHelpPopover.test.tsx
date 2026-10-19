import React from 'react'
import { render, screen } from '@testing-library/react'
import SignsSearchHelp from 'signs/ui/search/SignsSearchHelpPopover'
import signSearchHelpList from 'signs/ui/search/signSearchHelpList.json'

it('lists every sign list abbreviation with its reference', () => {
  render(<SignsSearchHelp />)

  expect(screen.getAllByRole('listitem')).toHaveLength(
    signSearchHelpList.length,
  )
  expect(screen.getByText('MesZL')).toBeVisible()
  expect(screen.getByText('Mesopotamisches Zeichenlexikon')).toBeVisible()
})
