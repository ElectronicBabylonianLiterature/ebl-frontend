import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditStatus, Line, ManuscriptLine } from 'corpus/domain/line'
import { buildEditLiteLines } from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  manuscriptGroup,
  RenderedPanel,
  renderPanel,
} from 'corpus/ui/edit-lite/LineEditPanel.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

const [firstLine]: readonly Line[] = buildEditLiteLines()

function manuscriptLines(view: RenderedPanel): readonly ManuscriptLine[] {
  return view.currentLine().variants[0].manuscripts
}

test('shows one compact row per manuscript line', () => {
  renderPanel(firstLine)
  const row = within(manuscriptGroup(1, 2))

  expect(row.getByRole('button', { name: 'Siglum BabaNBSch1' })).toBeVisible()
  expect(row.getByRole('textbox', { name: 'Labels' })).toHaveValue('o i')
  expect(row.getByRole('textbox', { name: 'Line number' })).toHaveValue("6'")
  expect(row.getByRole('textbox', { name: 'Text' })).toHaveTextContent(
    '[x x x] e-li-iš',
  )
})

test('the siglum is changed with a lazily mounted select', async () => {
  const view = renderPanel(firstLine)
  const row = within(manuscriptGroup(1, 1))
  await userEvent.click(row.getByRole('button', { name: 'Siglum NinNA1a' }))
  await userEvent.selectOptions(row.getByRole('combobox'), 'BabaNBSch1')

  expect(manuscriptLines(view)[0].manuscriptId).toBe(2)
  expect(manuscriptLines(view)[1]).toBe(firstLine.variants[0].manuscripts[1])
  expect(view.currentLine().status).toBe(EditStatus.EDITED)
  expect(screen.getAllByRole('option')).toHaveLength(2)
})

test('the labels are typed separated by spaces', async () => {
  const view = renderPanel(firstLine)
  const labels = within(manuscriptGroup(1, 1)).getByRole('textbox', {
    name: 'Labels',
  })
  await userEvent.type(labels, ' ')

  expect(labels).toHaveValue('o ')
  expect(manuscriptLines(view)[0].labels).toEqual(['o'])

  await userEvent.type(labels, 'iii')

  expect(labels).toHaveValue('o iii')
  expect(manuscriptLines(view)[0].labels).toEqual(['o', 'iii'])

  await userEvent.clear(labels)

  expect(manuscriptLines(view)[0].labels).toEqual([])
})

test('the labels follow a change from outside', async () => {
  renderPanel(firstLine)
  const labels = within(manuscriptGroup(1, 1)).getByRole('textbox', {
    name: 'Labels',
  })
  await userEvent.type(labels, ' iii ')
  await userEvent.click(screen.getByRole('button', { name: 'Restore' }))

  expect(labels).toHaveValue('o')
})

test('the line number and the text are edited', async () => {
  const view = renderPanel(firstLine)
  const row = within(manuscriptGroup(1, 2))
  await userEvent.type(row.getByRole('textbox', { name: 'Line number' }), 'a')
  await userEvent.click(row.getByRole('textbox', { name: 'Text' }))
  await userEvent.type(
    within(row.getByRole('group', { name: 'Text' })).getByRole('textbox'),
    ' x',
  )

  expect(manuscriptLines(view)[1]).toEqual({
    ...firstLine.variants[0].manuscripts[1],
    number: "6'a",
    atf: '[x x x] e-li-iš x',
  })
  expect(manuscriptLines(view)[1]).toBeInstanceOf(ManuscriptLine)
  expect(manuscriptLines(view)[0]).toBe(firstLine.variants[0].manuscripts[0])
})
