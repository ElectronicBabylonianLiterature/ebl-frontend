import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createLine, createVariant, EditStatus, Line } from 'corpus/domain/line'
import ChapterLineForm from 'corpus/ui/lines/ChapterLineForm'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

function showForm(status: EditStatus): jest.Mock<void, [Line]> {
  const onChange = jest.fn<void, [Line]>()
  render(
    <ChapterLineForm
      value={createLine({ number: '1', status })}
      manuscripts={[]}
      onChange={onChange}
    />,
  )
  return onChange
}

describe.each([
  [EditStatus.CLEAN, EditStatus.EDITED],
  [EditStatus.EDITED, EditStatus.EDITED],
  [EditStatus.NEW, EditStatus.NEW],
])('line with status %s', (status, expectedStatus) => {
  test('changing the number', () => {
    const onChange = showForm(status)

    fireEvent.change(screen.getByLabelText('Number'), {
      target: { value: '2' },
    })

    expect(onChange).toHaveBeenCalledWith(
      createLine({ number: '2', status: expectedStatus }),
    )
  })

  test('adding a variant', async () => {
    const onChange = showForm(status)

    await userEvent.click(screen.getByRole('button', { name: 'Add variant' }))

    expect(onChange).toHaveBeenCalledWith(
      createLine({
        number: '1',
        variants: [createVariant({})],
        status: expectedStatus,
      }),
    )
  })

  test('changing the translation', () => {
    const onChange = showForm(status)

    fireEvent.change(screen.getByLabelText(/^Translation-/), {
      target: { value: 'translation' },
    })

    expect(onChange).toHaveBeenCalledWith(
      createLine({
        number: '1',
        translation: 'translation',
        status: expectedStatus,
      }),
    )
  })
})

test('deleting the line', async () => {
  const onChange = showForm(EditStatus.NEW)

  await userEvent.click(screen.getByRole('button', { name: 'Delete line' }))

  expect(onChange).toHaveBeenCalledWith(
    createLine({ number: '1', status: EditStatus.DELETED }),
  )
})
