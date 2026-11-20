import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createManuscriptLine,
  createVariant,
  EditStatus,
  Line,
} from 'corpus/domain/line'
import { buildEditLiteLines } from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  manuscriptGroup,
  renderPanel,
  variantGroup,
} from 'corpus/ui/edit-lite/LineEditPanel.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

const [firstLine, secondLine]: readonly Line[] = buildEditLiteLines()

function button(name: string): HTMLElement {
  return screen.getByRole('button', { name })
}

test('Add variant appends an empty variant to the draft', async () => {
  const view = renderPanel(firstLine)

  expect(
    screen.queryByRole('group', { name: 'Variant 2' }),
  ).not.toBeInTheDocument()

  await userEvent.click(button('Add variant'))

  expect(view.currentLine().variants).toEqual([
    firstLine.variants[0],
    createVariant({}),
  ])
  expect(view.currentLine().variants[0]).toBe(firstLine.variants[0])
  expect(view.currentLine().status).toBe(EditStatus.EDITED)
  expect(
    within(variantGroup(2)).getByRole('textbox', { name: 'Intertext' }),
  ).toBeEmptyDOMElement()
  expect(within(variantGroup(2)).queryByRole('group')).not.toBeInTheDocument()
})

test('Delete variant removes that variant from the draft', async () => {
  const view = renderPanel(secondLine)
  await userEvent.click(button('Delete variant 1'))

  expect(view.currentLine().variants).toEqual([secondLine.variants[1]])
  expect(view.currentLine().status).toBe(EditStatus.EDITED)
  expect(
    within(variantGroup(1)).getByRole('textbox', {
      name: 'Ideal reconstruction',
    }),
  ).toHaveTextContent('%n šapliš | erṣetu')
  expect(
    screen.queryByRole('group', { name: 'Variant 2' }),
  ).not.toBeInTheDocument()
})

test('the last variant cannot be deleted', async () => {
  renderPanel(secondLine)

  expect(
    screen.getAllByRole('button', { name: /^Delete variant/ }),
  ).toHaveLength(2)

  await userEvent.click(button('Delete variant 2'))

  expect(
    screen.queryByRole('button', { name: /^Delete variant/ }),
  ).not.toBeInTheDocument()
  expect(button('Add variant')).toBeEnabled()
})

test('Add manuscript line appends a row without a siglum to that variant', async () => {
  const view = renderPanel(secondLine)
  await userEvent.click(
    within(variantGroup(2)).getByRole('button', {
      name: 'Add manuscript line',
    }),
  )

  expect(view.currentLine().variants[0]).toBe(secondLine.variants[0])
  expect(view.currentLine().variants[1].manuscripts).toEqual([
    createManuscriptLine({}),
  ])
  expect(
    within(manuscriptGroup(2, 1)).getByRole('button', {
      name: 'Siglum <unknown>',
    }),
  ).toBeVisible()
  expect(screen.queryByRole('option')).not.toBeInTheDocument()
})

test('Delete removes that manuscript line from its variant', async () => {
  const view = renderPanel(firstLine)
  await userEvent.click(button('Delete manuscript line 1'))

  expect(view.currentLine().variants[0].manuscripts).toEqual([
    firstLine.variants[0].manuscripts[1],
  ])
  expect(
    within(manuscriptGroup(1, 1)).getByRole('button', {
      name: 'Siglum BabaNBSch1',
    }),
  ).toBeVisible()
  expect(
    within(manuscriptGroup(1, 1)).getByRole('textbox', { name: 'Labels' }),
  ).toHaveValue('o i')

  await userEvent.click(button('Delete manuscript line 1'))

  expect(view.currentLine().variants[0].manuscripts).toEqual([])
  expect(
    screen.queryByRole('group', { name: /^Manuscript line/ }),
  ).not.toBeInTheDocument()
})

test('a disabled panel keeps its structure', () => {
  renderPanel(secondLine, true)

  expect(button('Add variant')).toBeDisabled()
  expect(button('Delete variant 1')).toBeDisabled()
  expect(button('Delete manuscript line 1')).toBeDisabled()
  screen
    .getAllByRole('button', { name: 'Add manuscript line' })
    .forEach((addButton) => expect(addButton).toBeDisabled())
})

test('a reader sees the line without any control that changes it', async () => {
  const view = renderPanel(secondLine, false, { canWrite: false })

  expect(
    screen.getAllByRole('button').map((control) => control.textContent),
  ).toEqual(['Restore'])
  expect(screen.getByLabelText('Number')).toBeDisabled()
  expect(screen.getByLabelText('second line of parallelism')).toBeDisabled()
  expect(screen.getByLabelText('beginning of a section')).toBeDisabled()
  expect(
    within(manuscriptGroup(1, 1)).getByRole('textbox', { name: 'Labels' }),
  ).toBeDisabled()
  expect(
    within(manuscriptGroup(1, 1)).getByRole('textbox', { name: 'Line number' }),
  ).toBeDisabled()
  expect(within(manuscriptGroup(1, 1)).getByText('NinNA1a')).toBeVisible()
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument()

  await userEvent.click(screen.getByRole('textbox', { name: 'Translation' }))
  await userEvent.click(within(manuscriptGroup(1, 1)).getByText('NinNA1a'))

  expect(
    screen
      .getAllByRole('textbox')
      .filter((element) => element.tagName === 'TEXTAREA'),
  ).toHaveLength(0)
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  expect(view.onChange).not.toHaveBeenCalled()
})
