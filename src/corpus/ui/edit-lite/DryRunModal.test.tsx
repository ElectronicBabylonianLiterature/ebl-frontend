import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  ChapterRequest,
  LinesUpdateDto,
} from 'corpus/application/edit-lite/ChapterEditSource'
import { toLineEditsDto } from 'corpus/application/edit-lite/lineEdits'
import DryRunModal, {
  createDryRunNotice,
  dryRunNotice,
  formatRequestTarget,
} from 'corpus/ui/edit-lite/DryRunModal'
import { buildEditLiteLines } from 'corpus/ui/edit-lite/editLite.testSupport'

const payload: LinesUpdateDto = toLineEditsDto(2, buildEditLiteLines()[2])
const dryRunTarget =
  'POST /texts/L/1/2/chapters/Standard%20Babylonian/I/lines?view=outline&revision=revision-1'
const request: ChapterRequest = {
  method: 'POST',
  url: '/texts/L/1/2/chapters/Standard%20Babylonian/I/lines?view=outline&revision=revision-1',
  body: payload,
}

test('shows nothing without a payload', () => {
  render(<DryRunModal request={null} onHide={jest.fn()} />)

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('shows the request and states that nothing was sent', () => {
  render(<DryRunModal request={request} onHide={jest.fn()} />)
  const dialog = within(screen.getByRole('dialog', { name: 'Request preview' }))

  expect(dialog.getByText(dryRunNotice)).toBeVisible()
  expect(dryRunNotice).toContain('nothing was sent')
  expect(dialog.getByText(dryRunTarget)).toBeVisible()
  expect(formatRequestTarget(request)).toBe(dryRunTarget)
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
  render(<DryRunModal request={request} onHide={onHide} />)
  await userEvent.click(findControl())

  expect(onHide).toHaveBeenCalledTimes(1)
})

test('shows the notice of the request it is given', () => {
  const notice = createDryRunNotice('deleting the line')
  render(<DryRunModal request={request} notice={notice} onHide={jest.fn()} />)
  const dialog = within(screen.getByRole('dialog', { name: 'Request preview' }))

  expect(notice).toBe(
    'Dry run: nothing was sent to the server. This is the request that deleting the line would send.',
  )
  expect(dialog.getByText(notice)).toBeVisible()
  expect(dialog.queryByText(dryRunNotice)).not.toBeInTheDocument()
})
