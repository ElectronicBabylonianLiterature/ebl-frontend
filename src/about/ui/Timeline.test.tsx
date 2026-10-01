import React from 'react'
import { render, screen, act } from '@testing-library/react'
import Timeline, { TimelineItem } from 'about/ui/Timeline'

let observerCallback: IntersectionObserverCallback
const mockDisconnect = jest.fn()
const mockObserve: jest.MockedFunction<IntersectionObserver['observe']> =
  jest.fn()

function getObservedElement(index: number): Element {
  return mockObserve.mock.calls[index][0]
}

const observer: IntersectionObserver = {
  observe: mockObserve,
  unobserve: jest.fn(),
  disconnect: mockDisconnect,
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: jest.fn(),
}

function intersect(target: Element, isIntersecting: boolean): void {
  const rect = target.getBoundingClientRect()
  act(() => {
    observerCallback(
      [
        {
          target,
          isIntersecting,
          boundingClientRect: rect,
          intersectionRect: rect,
          intersectionRatio: isIntersecting ? 1 : 0,
          rootBounds: null,
          time: 0,
        },
      ],
      observer,
    )
  })
}

beforeEach(() => {
  mockDisconnect.mockClear()
  mockObserve.mockClear()
  Object.defineProperty(window, 'IntersectionObserver', {
    configurable: true,
    writable: true,
    value: jest.fn((callback: IntersectionObserverCallback) => {
      observerCallback = callback
      return observer
    }),
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

test('renders titles as headings and dates as time elements', () => {
  render(<Timeline items={items} />)

  expect(screen.getByRole('heading', { name: 'First' })).toBeInTheDocument()
  expect(screen.getByText('2024').tagName).toBe('TIME')
})

test('observes all timeline items', () => {
  render(<Timeline items={items} />)
  expect(mockObserve).toHaveBeenCalledTimes(2)
})

test('adds visible class when item intersects', () => {
  render(<Timeline items={items} />)
  const firstItem = getObservedElement(0)

  intersect(firstItem, true)

  expect(firstItem).toHaveClass('timeline-item--visible')
})

test('does not add visible class when item is not intersecting', () => {
  render(<Timeline items={items} />)
  const firstItem = getObservedElement(0)

  intersect(firstItem, false)

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
  Reflect.deleteProperty(window, 'IntersectionObserver')

  render(<Timeline items={items} />)

  expect(mockObserve).not.toHaveBeenCalled()
  expect(screen.getByText('First')).toBeInTheDocument()
  expect(screen.getByText('Second')).toBeInTheDocument()
})
