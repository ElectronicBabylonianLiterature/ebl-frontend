import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import referencePopover from 'bibliography/ui/referencePopover'
import { referenceFactory } from 'test-support/bibliography-fixtures'

const ReferencePopover = referencePopover(() => <span>Reference details</span>)

test.each(['{Enter}', ' '])(
  'opens with %s and dismisses with Escape while retaining trigger focus',
  async (key) => {
    const submit = jest.fn((event) => event.preventDefault())
    render(
      <form onSubmit={submit}>
        <ReferencePopover reference={referenceFactory.build()} />
      </form>,
    )
    const trigger = screen.getByRole('button', { name: 'Reference details' })

    expect(trigger).toHaveAttribute('type', 'button')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.tab()
    expect(trigger).toHaveFocus()
    await userEvent.keyboard(key)

    const popover = await screen.findByRole('tooltip')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger).toHaveAttribute('aria-controls', popover.id)
    const externalLink = screen.getByRole('link', {
      name: 'Open in a new window.',
    })
    expect(externalLink).toBeVisible()
    expect(submit).not.toHaveBeenCalled()

    await userEvent.tab()
    expect(externalLink).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('tooltip')).toBeVisible()
    await userEvent.keyboard('{Escape}')
    await waitFor(() =>
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument(),
    )
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
  },
)

test('keeps its id through rerenders and closes on trigger and outside clicks', async () => {
  const reference = referenceFactory.build()
  const contents = (
    <>
      <ReferencePopover reference={reference} />
      <button type="button">Outside</button>
    </>
  )
  const view = render(contents)
  const trigger = screen.getByRole('button', { name: 'Reference details' })

  await userEvent.click(trigger)
  const id = (await screen.findByRole('tooltip')).id
  view.rerender(contents)
  expect(screen.getByRole('tooltip')).toHaveAttribute('id', id)
  await userEvent.click(trigger)
  await waitFor(() =>
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument(),
  )

  await userEvent.click(trigger)
  expect(await screen.findByRole('tooltip')).toHaveAttribute('id', id)
  await userEvent.click(screen.getByRole('button', { name: 'Outside' }))
  await waitFor(() =>
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument(),
  )
  expect(trigger).toHaveAttribute('aria-expanded', 'false')
})
