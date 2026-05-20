import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import NewsletterTimeline from 'about/ui/NewsletterTimeline'
import { setReducedMotionMatchMedia } from 'test-support/matchMedia'

const mockScrollIntoView = jest.fn()

beforeEach(() => {
  mockScrollIntoView.mockClear()
  HTMLElement.prototype.scrollIntoView = mockScrollIntoView
})

const newsletters = [
  { content: 'Content 3', date: new Date('2025-03-01'), number: 3 },
  { content: 'Content 2', date: new Date('2024-06-01'), number: 2 },
  { content: 'Content 1', date: new Date('2024-01-01'), number: 1 },
]

function renderNewsletterTimeline({
  activeNewsletter = newsletters[0],
  onSelectNewsletter = jest.fn(),
}: {
  activeNewsletter?: (typeof newsletters)[number]
  onSelectNewsletter?: (newsletter: (typeof newsletters)[number]) => void
} = {}) {
  return render(
    <NewsletterTimeline
      newsletters={newsletters}
      activeNewsletter={activeNewsletter}
      onSelectNewsletter={onSelectNewsletter}
    />,
  )
}

test('renders all newsletter items', () => {
  renderNewsletterTimeline()
  expect(screen.getByText('#3')).toBeInTheDocument()
  expect(screen.getByText('#2')).toBeInTheDocument()
  expect(screen.getByText('#1')).toBeInTheDocument()
})

test('renders edition count', () => {
  renderNewsletterTimeline()
  expect(screen.getByText('3 editions')).toBeInTheDocument()
})

test('marks active item with active class', () => {
  renderNewsletterTimeline({ activeNewsletter: newsletters[1] })
  const activeButton = screen.getByRole('button', { name: /#2/ })
  expect(activeButton).toHaveClass('newsletter-tree-item--active')
})

test('sets aria-current on active item', () => {
  renderNewsletterTimeline()
  const activeButton = screen.getByRole('button', { name: /#3/ })
  expect(activeButton).toHaveAttribute('aria-current', 'true')

  const inactiveButton = screen.getByRole('button', { name: /#2/ })
  expect(inactiveButton).not.toHaveAttribute('aria-current')
})

test('calls onSelectNewsletter when clicked', () => {
  const onSelect = jest.fn()
  renderNewsletterTimeline({ onSelectNewsletter: onSelect })
  fireEvent.click(screen.getByText('#2'))
  expect(onSelect).toHaveBeenCalledWith(newsletters[1])
})

test('scrolls active item into view on mount', () => {
  renderNewsletterTimeline()
  expect(mockScrollIntoView).toHaveBeenCalledWith({
    behavior: 'smooth',
    block: 'nearest',
  })
})

test('scrolls into view when active newsletter changes', () => {
  const { rerender } = renderNewsletterTimeline()
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
  const restoreMatchMedia = setReducedMotionMatchMedia(true)

  renderNewsletterTimeline()

  expect(mockScrollIntoView).toHaveBeenCalledWith({
    behavior: 'auto',
    block: 'nearest',
  })

  restoreMatchMedia()
})

test('formats dates correctly', () => {
  renderNewsletterTimeline()
  expect(screen.getByText('Mar 2025')).toBeInTheDocument()
  expect(screen.getByText('Jun 2024')).toBeInTheDocument()
  expect(screen.getByText('Jan 2024')).toBeInTheDocument()
})

test('newsletter items are keyboard accessible buttons', () => {
  renderNewsletterTimeline()
  const buttons = screen.getAllByRole('button')
  expect(buttons).toHaveLength(3)
})
