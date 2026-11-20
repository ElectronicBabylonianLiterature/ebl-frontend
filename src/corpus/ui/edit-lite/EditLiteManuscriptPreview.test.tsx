import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChapterRequest } from 'corpus/application/edit-lite/ChapterEditSource'
import EditLiteManuscriptPreview, {
  manuscriptsPreviewNotice,
} from 'corpus/ui/edit-lite/EditLiteManuscriptPreview'

const target = 'POST /texts/L/1/2/chapters/Old%20Babylonian/I/manuscripts'
const payload: Readonly<Record<string, unknown>> = {
  manuscripts: [{ id: 1, notes: 'a note' }],
  uncertainFragments: ['K.1'],
}
const request: ChapterRequest = {
  method: 'POST',
  url: '/texts/L/1/2/chapters/Old%20Babylonian/I/manuscripts',
  body: payload,
}

test('shows nothing without a payload', () => {
  render(<EditLiteManuscriptPreview request={null} onHide={jest.fn()} />)

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('shows the request and states that nothing was sent', () => {
  render(<EditLiteManuscriptPreview request={request} onHide={jest.fn()} />)
  const dialog = within(screen.getByRole('dialog', { name: 'Request preview' }))

  expect(dialog.getByText(manuscriptsPreviewNotice)).toBeVisible()
  expect(manuscriptsPreviewNotice).toContain('nothing was sent')
  expect(dialog.getByText(target)).toBeVisible()
  expect(dialog.getByLabelText('Request body')).toHaveTextContent(
    '{\n  "manuscripts": [\n    {\n      "id": 1,\n      "notes": "a note"\n    }\n  ],\n  "uncertainFragments": [\n    "K.1"\n  ]\n}',
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
  render(<EditLiteManuscriptPreview request={request} onHide={onHide} />)
  await userEvent.click(findControl())

  expect(onHide).toHaveBeenCalledTimes(1)
})
