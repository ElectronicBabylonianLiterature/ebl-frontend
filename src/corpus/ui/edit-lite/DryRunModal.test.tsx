import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LinesUpdateDto } from 'corpus/application/edit-lite/ChapterEditSource'
import { toLineEditsDto } from 'corpus/application/edit-lite/lineEdits'
import DryRunModal, {
  dryRunNotice,
  dryRunTarget,
} from 'corpus/ui/edit-lite/DryRunModal'
import { buildEditLiteLines } from 'corpus/ui/edit-lite/editLite.testSupport'

const payload: LinesUpdateDto = toLineEditsDto(2, buildEditLiteLines()[2])

test('shows nothing without a payload', () => {
  render(<DryRunModal payload={null} onHide={jest.fn()} />)

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('shows the request and states that nothing was sent', () => {
  render(<DryRunModal payload={payload} onHide={jest.fn()} />)
  const dialog = within(screen.getByRole('dialog', { name: 'Request preview' }))

  expect(dialog.getByText(dryRunNotice)).toBeVisible()
  expect(dryRunNotice).toContain('nothing was sent')
  expect(dialog.getByText(dryRunTarget)).toBeVisible()
  expect(dryRunTarget).toBe('POST …/lines')
  expect(dialog.getByLabelText('Request body')).toHaveTextContent(
    JSON.stringify(payload, null, 2),
    { normalizeWhitespace: false },
  )
  expect(dialog.getByLabelText('Request body')).toHaveTextContent(
    '\n  "edited": [\n    {\n      "index": 2,',
    { normalizeWhitespace: false },
  )
})

test.each([
  ['the close icon', (): HTMLElement => screen.getByLabelText('Close')],
  [
    'the close button',
    (): HTMLElement => screen.getByText('Close', { selector: 'button' }),
  ],
])('%s hides the dialog', async (_name, findControl) => {
  const onHide = jest.fn()
  render(<DryRunModal payload={payload} onHide={onHide} />)
  await userEvent.click(findControl())

  expect(onHide).toHaveBeenCalledTimes(1)
})
