import React from 'react'
import { render, screen, act } from '@testing-library/react'
import Timeline, { TimelineItem } from 'about/ui/Timeline'

let observerCallback: IntersectionObserverCallback
const mockDisconnect = jest.fn()
const mockObserve = jest.fn()

function getObservedElement(index: number): Element {
  return mockObserve.mock.calls[index][0] as Element
}

beforeEach(() => {
  mockDisconnect.mockClear()
  mockObserve.mockClear()
  ;(window as unknown as Record<string, unknown>).IntersectionObserver =
    jest.fn((callback: IntersectionObserverCallback) => {
      observerCallback = callback
      return {
        observe: mockObserve,
        unobserve: jest.fn(),
        disconnect: mockDisconnect,
        root: null,
        rootMargin: '',
        thresholds: [],
        takeRecords: jest.fn(),
      }
    })
})

const items: TimelineItem[] = [
  {
    id: 'item-1',
    date: '2024',
    title: 'First',
    content: <p>First content</p>,
  },
  {
    id: 'item-2',
    date: '2025',
    title: 'Second',
    content: <p>Second content</p>,
  },
]

test('renders all timeline items', () => {
  render(<Timeline items={items} />)
  expect(screen.getByText('First')).toBeInTheDocument()
  expect(screen.getByText('Second')).toBeInTheDocument()
})

test('observes all timeline items', () => {
  render(<Timeline items={items} />)
  expect(mockObserve).toHaveBeenCalledTimes(2)
})

test('adds visible class when item intersects', () => {
  render(<Timeline items={items} />)
  const firstItem = getObservedElement(0)

  act(() => {
    observerCallback(
      [
        {
          target: firstItem,
          isIntersecting: true,
        } as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver,
    )
  })

  expect(firstItem).toHaveClass('timeline-item--visible')
})

test('does not add visible class when item is not intersecting', () => {
  render(<Timeline items={items} />)
  const firstItem = getObservedElement(0)

  act(() => {
    observerCallback(
      [
        {
          target: firstItem,
          isIntersecting: false,
        } as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver,
    )
  })

  expect(firstItem).not.toHaveClass('timeline-item--visible')
})

test('disconnects observer on unmount', () => {
  const { unmount } = render(<Timeline items={items} />)
  unmount()
  expect(mockDisconnect).toHaveBeenCalled()
})

test('alternates left and right positioning', () => {
  render(<Timeline items={items} />)
  expect(getObservedElement(0)).toHaveClass('timeline-item--left')
  expect(getObservedElement(1)).toHaveClass('timeline-item--right')
})

test('shows all items when IntersectionObserver is unavailable', () => {
  delete (window as unknown as Record<string, unknown>).IntersectionObserver

  render(<Timeline items={items} />)

  expect(mockObserve).not.toHaveBeenCalled()
  expect(screen.getByText('First')).toBeInTheDocument()
  expect(screen.getByText('Second')).toBeInTheDocument()
})
