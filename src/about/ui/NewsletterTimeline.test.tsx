import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import NewsletterTimeline from 'about/ui/NewsletterTimeline'

const mockScrollIntoView = jest.fn()

beforeEach(() => {
  mockScrollIntoView.mockClear()
  HTMLElement.prototype.scrollIntoView = mockScrollIntoView
})

const newsletters = [
  { content: 'Content 3', date: new Date('2025-03-01'), number: 3 },
  { content: 'Content 2', date: new Date('2024-06-01'), number: 2 },
  { content: 'Content 1', date: new Date('2024-01-01'), number: 1 },
] as const

function createMatchMedia(preferReducedMotion: boolean) {
  return (query: string): MediaQueryList =>
    ({
      matches:
        preferReducedMotion && query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }) as MediaQueryList
}

test('renders all newsletter items', () => {
  render(
    <NewsletterTimeline
      newsletters={newsletters}
      activeNewsletter={newsletters[0]}
      onSelectNewsletter={jest.fn()}
    />,
  )
  expect(screen.getByText('#3')).toBeInTheDocument()
  expect(screen.getByText('#2')).toBeInTheDocument()
  expect(screen.getByText('#1')).toBeInTheDocument()
})

test('renders edition count', () => {
  render(
    <NewsletterTimeline
      newsletters={newsletters}
      activeNewsletter={newsletters[0]}
      onSelectNewsletter={jest.fn()}
    />,
  )
  expect(screen.getByText('3 editions')).toBeInTheDocument()
})

test('marks active item with active class', () => {
  render(
    <NewsletterTimeline
      newsletters={newsletters}
      activeNewsletter={newsletters[1]}
      onSelectNewsletter={jest.fn()}
    />,
  )
  const activeButton = screen.getByRole('button', { name: /#2/ })
  expect(activeButton).toHaveClass('newsletter-tree-item--active')
})

test('sets aria-current on active item', () => {
  render(
    <NewsletterTimeline
      newsletters={newsletters}
      activeNewsletter={newsletters[0]}
      onSelectNewsletter={jest.fn()}
    />,
  )
  const activeButton = screen.getByRole('button', { name: /#3/ })
  expect(activeButton).toHaveAttribute('aria-current', 'true')

  const inactiveButton = screen.getByRole('button', { name: /#2/ })
  expect(inactiveButton).not.toHaveAttribute('aria-current')
})

test('calls onSelectNewsletter when clicked', () => {
  const onSelect = jest.fn()
  render(
    <NewsletterTimeline
      newsletters={newsletters}
      activeNewsletter={newsletters[0]}
      onSelectNewsletter={onSelect}
    />,
  )
  fireEvent.click(screen.getByText('#2'))
  expect(onSelect).toHaveBeenCalledWith(newsletters[1])
})

test('scrolls active item into view on mount', () => {
  render(
    <NewsletterTimeline
      newsletters={newsletters}
      activeNewsletter={newsletters[0]}
      onSelectNewsletter={jest.fn()}
    />,
  )
  expect(mockScrollIntoView).toHaveBeenCalledWith({
    behavior: 'smooth',
    block: 'nearest',
  })
})

test('scrolls into view when active newsletter changes', () => {
  const { rerender } = render(
    <NewsletterTimeline
      newsletters={newsletters}
      activeNewsletter={newsletters[0]}
      onSelectNewsletter={jest.fn()}
    />,
  )
  mockScrollIntoView.mockClear()
  rerender(
    <NewsletterTimeline
      newsletters={newsletters}
      activeNewsletter={newsletters[1]}
      onSelectNewsletter={jest.fn()}
    />,
  )
  expect(mockScrollIntoView).toHaveBeenCalledWith({
    behavior: 'smooth',
    block: 'nearest',
  })
})

test('uses non-animated scroll when reduced motion is enabled', () => {
  const originalMatchMedia = window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: createMatchMedia(true),
  })

  render(
    <NewsletterTimeline
      newsletters={newsletters}
      activeNewsletter={newsletters[0]}
      onSelectNewsletter={jest.fn()}
    />,
  )

  expect(mockScrollIntoView).toHaveBeenCalledWith({
    behavior: 'auto',
    block: 'nearest',
  })

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: originalMatchMedia,
  })
})

test('formats dates correctly', () => {
  render(
    <NewsletterTimeline
      newsletters={newsletters}
      activeNewsletter={newsletters[0]}
      onSelectNewsletter={jest.fn()}
    />,
  )
  expect(screen.getByText('Mar 2025')).toBeInTheDocument()
  expect(screen.getByText('Jun 2024')).toBeInTheDocument()
  expect(screen.getByText('Jan 2024')).toBeInTheDocument()
})

test('newsletter items are keyboard accessible buttons', () => {
  render(
    <NewsletterTimeline
      newsletters={newsletters}
      activeNewsletter={newsletters[0]}
      onSelectNewsletter={jest.fn()}
    />,
  )
  const buttons = screen.getAllByRole('button')
  expect(buttons).toHaveLength(3)
})
