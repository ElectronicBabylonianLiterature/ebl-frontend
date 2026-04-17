import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Library from 'library/ui/Library'

jest.mock('library/ui/LibrarySidebar', () => ({
  __esModule: true,
  default: ({ activeSection }: { activeSection: string }) => (
    <div data-testid="sidebar">{activeSection || 'none'}</div>
  ),
}))

function renderLibrary(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Library>
        <div>child content</div>
      </Library>
    </MemoryRouter>,
  )
}

test('renders children', () => {
  renderLibrary('/reference-library')
  expect(screen.getByText('child content')).toBeInTheDocument()
})

test('sets activeSection to signs', () => {
  renderLibrary('/reference-library/signs')
  expect(screen.getByTestId('sidebar')).toHaveTextContent('signs')
})

test('sets activeSection to dictionary', () => {
  renderLibrary('/reference-library/dictionary')
  expect(screen.getByTestId('sidebar')).toHaveTextContent('dictionary')
})

test('sets activeSection to bibliography', () => {
  renderLibrary('/reference-library/bibliography')
  expect(screen.getByTestId('sidebar')).toHaveTextContent('bibliography')
})

test('sets empty activeSection for unknown path', () => {
  renderLibrary('/reference-library/other')
  expect(screen.getByTestId('sidebar')).toHaveTextContent('none')
})
