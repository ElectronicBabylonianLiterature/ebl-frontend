import { act, fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  controller,
  panel,
  renderPanel,
} from 'map/MapSpatialSearchPanel.testSupport'

it.each([false, true])(
  'restores focus after pre-disable blur (body target: %s)',
  async (bodyTarget) => {
    const { rerender } = renderPanel(controller({ isDrawing: true }))
    const addCorner = screen.getByRole('button', {
      name: 'Add corner at map center',
    })
    await userEvent.click(addCorner)
    expect(addCorner).toHaveFocus()
    if (bodyTarget) fireEvent.blur(addCorner, { relatedTarget: document.body })
    act(() => addCorner.blur())
    expect(document.body).toHaveFocus()

    rerender(panel(controller({ isDrawing: false })))

    expect(addCorner).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Draw a rectangle' }),
    ).toHaveFocus()
  },
)

it('does not take focus away from another control when drawing ends', async () => {
  const { rerender } = renderPanel(controller({ isDrawing: true }))
  const addCorner = screen.getByRole('button', {
    name: 'Add corner at map center',
  })
  await userEvent.click(addCorner)
  act(() => addCorner.blur())
  const viewport = screen.getByRole('button', { name: 'Search current view' })
  await userEvent.click(viewport)
  expect(viewport).toHaveFocus()

  rerender(panel(controller({ isDrawing: false })))

  expect(viewport).toHaveFocus()
})
