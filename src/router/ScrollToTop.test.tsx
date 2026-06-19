import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Link } from 'react-router-dom'
import ScrollToTop from 'router/ScrollToTop'

function renderWithRouter(): void {
  render(
    <MemoryRouter initialEntries={['/start']}>
      <ScrollToTop />
      <Link to="/next">next</Link>
      <Link to="/anchored#section">anchored</Link>
    </MemoryRouter>,
  )
}

describe('ScrollToTop', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('scrolls to the top on initial render', () => {
    renderWithRouter()
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('scrolls to the top when the pathname changes', () => {
    renderWithRouter()
    expect(window.scrollTo).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByText('next'))
    expect(window.scrollTo).toHaveBeenCalledTimes(2)
  })

  it('does not scroll to the top when navigating to a hash target', () => {
    renderWithRouter()
    expect(window.scrollTo).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByText('anchored'))
    expect(window.scrollTo).toHaveBeenCalledTimes(1)
  })
})
