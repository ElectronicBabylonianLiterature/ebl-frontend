import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Sign from 'signs/domain/Sign'
import SignCard from 'signs/ui/SignCard'

const sign = new Sign({
  name: 'NUNUZ',
  lists: [{ name: 'MZL', number: '614' }],
  values: [],
  logograms: [],
  fossey: [],
  mesZl: '',
  LaBaSi: '',
  unicode: [0x1226d],
})

it('shows the sign name as the page heading', () => {
  render(<SignCard sign={sign} />)
  expect(
    screen.getByRole('heading', { level: 1, name: 'NUNUZ' }),
  ).toBeInTheDocument()
  expect(screen.getByText('MesZL 614 · U+1226D')).toBeInTheDocument()
})

it('links the sign name in the compact card', () => {
  render(
    <MemoryRouter>
      <SignCard sign={sign} compact />
    </MemoryRouter>,
  )
  expect(screen.getByRole('link', { name: 'NUNUZ' })).toHaveAttribute(
    'href',
    '/signs/NUNUZ',
  )
  expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  expect(screen.getByText('MesZL 614 · U+1226D')).toBeInTheDocument()
})

it('renders the MesZL label through renderMesZl', () => {
  render(
    <MemoryRouter>
      <SignCard
        sign={sign}
        compact
        renderMesZl={(label) => <button type="button">{label}</button>}
      />
    </MemoryRouter>,
  )
  expect(screen.getByRole('button', { name: 'MesZL 614' })).toBeInTheDocument()
  expect(screen.getByText(/· U\+1226D/)).toBeInTheDocument()
})

it('shows only code points without a MesZL number', () => {
  render(<SignCard sign={new Sign({ ...sign, lists: [] })} />)
  expect(screen.getByText('U+1226D')).toBeInTheDocument()
})
