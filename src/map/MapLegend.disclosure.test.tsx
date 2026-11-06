import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MapLegend from 'map/MapLegend'
import { buildChoroplethLegend } from 'map/mapChoroplethScale'

const legend = buildChoroplethLegend('evidence', null, [])

function renderLegend(onOutsideClick = jest.fn()): ReturnType<typeof render> {
  return render(
    <>
      <MapLegend mode="evidence" legend={legend} />
      <button onClick={onOutsideClick}>Outside action</button>
    </>,
  )
}

it('keeps the scroll region open during internal focus and closes on Tab out', async () => {
  renderLegend()
  const toggle = screen.getByRole('button', { name: 'Legend' })
  await userEvent.click(toggle)
  await userEvent.tab()

  const body = screen.getByRole('region', { name: 'Map legend details' })
  expect(body).toHaveFocus()
  expect(fireEvent.keyDown(body, { key: 'ArrowDown' })).toBe(true)
  expect(toggle).toHaveAttribute('aria-expanded', 'true')

  await userEvent.tab()

  expect(screen.getByRole('button', { name: 'Outside action' })).toHaveFocus()
  expect(toggle).toHaveAttribute('aria-expanded', 'false')
  expect(screen.queryByRole('region')).not.toBeInTheDocument()
})

it('dismisses with Escape and returns focus to its toggle', async () => {
  renderLegend()
  const toggle = screen.getByRole('button', { name: 'Legend' })
  await userEvent.click(toggle)
  await userEvent.tab()

  expect(fireEvent.keyDown(screen.getByRole('region'), { key: 'Escape' })).toBe(
    false,
  )
  expect(toggle).toHaveFocus()
  expect(toggle).toHaveAttribute('aria-expanded', 'false')
})

it('keeps body interactions and preserves the first outside action', async () => {
  const onOutsideClick = jest.fn()
  renderLegend(onOutsideClick)
  const toggle = screen.getByRole('button', { name: 'Legend' })
  await userEvent.click(toggle)
  await userEvent.click(screen.getByText('Curated mapping'))

  expect(toggle).toHaveAttribute('aria-expanded', 'true')

  await userEvent.click(screen.getByRole('button', { name: 'Outside action' }))

  expect(onOutsideClick).toHaveBeenCalledTimes(1)
  expect(toggle).toHaveAttribute('aria-expanded', 'false')
})

it('consumes Escape only while expanded so active map tools keep their state', async () => {
  const onMapKeyDown = jest.fn()
  window.addEventListener('keydown', onMapKeyDown)
  renderLegend()
  const toggle = screen.getByRole('button', { name: 'Legend' })
  fireEvent.keyDown(toggle, { key: 'Escape' })
  expect(onMapKeyDown).toHaveBeenCalledTimes(1)

  await userEvent.click(toggle)
  fireEvent.keyDown(screen.getByRole('region'), { key: 'Escape' })

  expect(onMapKeyDown).toHaveBeenCalledTimes(1)
  expect(toggle).toHaveFocus()
  expect(toggle).toHaveAttribute('aria-expanded', 'false')
  window.removeEventListener('keydown', onMapKeyDown)
})

it('removes the outside listener when an expanded legend unmounts', async () => {
  const addListener = jest.spyOn(document, 'addEventListener')
  const removeListener = jest.spyOn(document, 'removeEventListener')
  const view = renderLegend()
  await userEvent.click(screen.getByRole('button', { name: 'Legend' }))
  const listener = addListener.mock.calls.find(
    ([type]) => type === 'pointerdown',
  )
  expect(listener).toBeDefined()

  view.unmount()

  expect(removeListener).toHaveBeenCalledWith('pointerdown', listener?.[1])
  addListener.mockRestore()
  removeListener.mockRestore()
})
