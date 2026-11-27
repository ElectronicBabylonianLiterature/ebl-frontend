import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Sign from 'signs/domain/Sign'
import SignSearchResult from 'signs/ui/search/SignSearchResult'

function makeSign(mesZl: string): Sign {
  return new Sign({
    name: 'NUNUZ',
    lists: [{ name: 'MZL', number: '614' }],
    values: [],
    logograms: [],
    fossey: [],
    mesZl,
    LaBaSi: '',
    unicode: [0x1226d],
  })
}

function renderResult(sign: Sign): void {
  render(
    <MemoryRouter>
      <SignSearchResult sign={sign} />
    </MemoryRouter>,
  )
}

it('opens the MesZL entry from the label in the sign card', async () => {
  renderResult(makeSign('614\t**NUNUZ**\t𒉭\nMade-up entry text.'))
  await userEvent.click(screen.getByRole('button', { name: 'MesZL 614' }))
  expect(await screen.findByText(/Made-up entry text/)).toBeInTheDocument()
})

it('shows the MesZL number as text when there is no entry', () => {
  renderResult(makeSign(''))
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
  expect(screen.getByText('MesZL 614 · U+1226D')).toBeInTheDocument()
})
