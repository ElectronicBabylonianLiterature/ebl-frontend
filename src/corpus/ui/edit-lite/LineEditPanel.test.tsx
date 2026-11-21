import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditStatus, Line } from 'corpus/domain/line'
import { buildEditLiteLines } from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  renderPanel,
  variantGroup,
} from 'corpus/ui/edit-lite/LineEditPanel.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

const [firstLine, secondLine]: readonly Line[] = buildEditLiteLines()

function mountedEditors(): HTMLElement[] {
  return screen
    .queryAllByRole('textbox')
    .filter((element) => element.tagName === 'TEXTAREA')
}

async function editAtf(
  container: HTMLElement,
  label: string,
  text: string,
): Promise<void> {
  await userEvent.click(within(container).getByRole('textbox', { name: label }))
  await userEvent.type(
    within(within(container).getByRole('group', { name: label })).getByRole(
      'textbox',
    ),
    text,
  )
}

test('shows the line without mounting any editor or option', () => {
  const view = renderPanel(firstLine)

  expect(view.currentLine()).toBe(firstLine)
  expect(screen.getByLabelText('Number')).toHaveValue('1')
  expect(screen.getByLabelText('second line of parallelism')).not.toBeChecked()
  expect(screen.getByLabelText('beginning of a section')).toBeChecked()
  expect(
    screen.getByRole('textbox', { name: 'Translation' }),
  ).toHaveTextContent('#tr.en: When on high #tr.ar: translation in Arabic')
  expect(
    screen.getByRole('textbox', { name: 'Ideal reconstruction' }),
  ).toHaveTextContent('%n enūma | eliš #note: a note')
  expect(
    screen.getByRole('textbox', { name: 'Intertext' }),
  ).toBeEmptyDOMElement()
  expect(screen.getAllByRole('textbox', { name: 'Text' })).toHaveLength(2)
  expect(mountedEditors()).toHaveLength(0)
  expect(screen.queryByRole('option')).not.toBeInTheDocument()
})

test('changing the number marks the line as edited', async () => {
  const view = renderPanel(firstLine)
  await userEvent.type(screen.getByLabelText('Number'), 'a')

  expect(view.onChange).toHaveBeenCalledTimes(1)
  expect(view.currentLine()).toEqual({
    ...firstLine,
    number: '1a',
    status: EditStatus.EDITED,
  })
  expect(screen.getByLabelText('Number')).toHaveValue('1a')
})

test('the flags can be toggled', async () => {
  const view = renderPanel(firstLine)
  await userEvent.click(screen.getByLabelText('second line of parallelism'))
  await userEvent.click(screen.getByLabelText('beginning of a section'))

  expect(view.currentLine()).toEqual({
    ...firstLine,
    isSecondLineOfParallelism: true,
    isBeginningOfSection: false,
    status: EditStatus.EDITED,
  })
})

test('the translation is edited in a lazily mounted editor', async () => {
  const view = renderPanel(firstLine)
  await editAtf(document.body, 'Translation', '!')

  expect(view.currentLine().translation).toBe(`${firstLine.translation}!`)
  expect(view.currentLine().status).toBe(EditStatus.EDITED)
  expect(mountedEditors()).toHaveLength(1)
})

test('the intertext and reconstruction of a variant are edited', async () => {
  const view = renderPanel(secondLine)
  await editAtf(variantGroup(2), 'Intertext', 'x')
  await editAtf(variantGroup(2), 'Ideal reconstruction', '?')
  const [firstVariant, secondVariant] = view.currentLine().variants

  expect(firstVariant).toBe(secondLine.variants[0])
  expect(secondVariant.intertext).toBe('x')
  expect(secondVariant.reconstruction).toBe('%n šapliš | erṣetu?')
  expect(view.currentLine().status).toBe(EditStatus.EDITED)
})

test('variants are captioned only when there are several', () => {
  const { unmount } = renderPanel(firstLine)

  expect(screen.queryByText('Variant 1')).not.toBeInTheDocument()
  expect(variantGroup(1)).toBeVisible()

  unmount()
  renderPanel(secondLine)

  expect(screen.getByText('Variant 1')).toBeVisible()
  expect(screen.getByText('Variant 2')).toBeVisible()
})

test('a variant without manuscripts has no manuscript rows', () => {
  renderPanel(secondLine)

  expect(within(variantGroup(1)).getByText('Siglum')).toBeVisible()
  expect(within(variantGroup(2)).queryByText('Siglum')).not.toBeInTheDocument()
})

test('a disabled view disables every control', async () => {
  const view = renderPanel(firstLine, true)
  await userEvent.click(screen.getByRole('textbox', { name: 'Translation' }))

  expect(screen.getByLabelText('Number')).toBeDisabled()
  expect(screen.getByLabelText('second line of parallelism')).toBeDisabled()
  expect(screen.getByLabelText('beginning of a section')).toBeDisabled()
  screen
    .getAllByRole('textbox', { name: /Labels|Line number/ })
    .forEach((input) => expect(input).toBeDisabled())
  screen
    .getAllByRole('button', { name: /Siglum/ })
    .forEach((button) => expect(button).toBeDisabled())
  expect(mountedEditors()).toHaveLength(0)
  expect(view.onChange).not.toHaveBeenCalled()
})
