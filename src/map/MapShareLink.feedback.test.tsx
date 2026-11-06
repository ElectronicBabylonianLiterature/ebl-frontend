import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import MapShareLink from 'map/MapShareLink'

beforeEach(() => {
  jest.useFakeTimers()
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: jest.fn(() => Promise.resolve()) },
  })
})

afterEach(() => jest.useRealTimers())

it('expires successful copy feedback after five seconds', async () => {
  render(<MapShareLink />)
  fireEvent.click(screen.getByRole('button', { name: 'Copy map link' }))
  await act(async () => {
    await Promise.resolve()
  })
  expect(screen.getByRole('status')).toHaveTextContent(
    'Map link copied to clipboard.',
  )
  act(() => jest.advanceTimersByTime(4999))
  expect(screen.getByRole('status')).toHaveTextContent(
    'Map link copied to clipboard.',
  )
  act(() => jest.advanceTimersByTime(1))
  expect(screen.getByRole('status')).toBeEmptyDOMElement()
})

it('clears feedback timers when the map control unmounts', async () => {
  const { unmount } = render(<MapShareLink />)
  fireEvent.click(screen.getByRole('button', { name: 'Copy map link' }))
  await act(async () => {
    await Promise.resolve()
  })
  expect(jest.getTimerCount()).toBe(1)
  unmount()
  expect(jest.getTimerCount()).toBe(0)
})
