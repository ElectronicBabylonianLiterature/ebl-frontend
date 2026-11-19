import React from 'react'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AccordionLines from 'corpus/ui/edit-lite/AccordionLines'
import {
  buildEditLiteLines,
  EditLiteRenderOptions,
  EditLiteRenderResult,
  renderWithEditLite,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import * as editLiteReducer from 'corpus/ui/edit-lite/editLiteReducer'
import { EditLiteState } from 'corpus/ui/edit-lite/editLiteState'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

let scrollIntoView: jest.Mock

function renderAccordion(
  initialLine?: number,
  options: EditLiteRenderOptions = {},
): EditLiteRenderResult {
  return renderWithEditLite(
    (state: EditLiteState) => (
      <AccordionLines state={state} initialLine={initialLine} />
    ),
    options,
  )
}

function header(lineNumber: string): HTMLElement {
  return screen.getByRole('button', {
    name: new RegExp(`^${lineNumber} %n`),
  })
}

function row(position: number): HTMLElement {
  return within(screen.getByRole('list', { name: 'Lines' })).getAllByRole(
    'listitem',
  )[position - 1]
}

function panel(lineNumber: string): HTMLElement {
  const panelId = header(lineNumber).getAttribute('aria-controls')
  return screen.getByText((_content, element) => element?.id === panelId)
}

function editors(): HTMLElement[] {
  return screen.queryAllByRole('group', { name: /^Editor for the line/ })
}

async function openLoadedRow(lineNumber: string): Promise<void> {
  await userEvent.click(header(lineNumber))
  await within(panel(lineNumber)).findByLabelText('Number')
}

beforeEach(() => {
  scrollIntoView = jest.fn()
  window.HTMLElement.prototype.scrollIntoView = scrollIntoView
})

afterEach(() => {
  jest.restoreAllMocks()
})

test('shows one collapsed row per line and loads nothing', () => {
  const { source } = renderAccordion()

  expect(row(1)).toContainElement(header('1'))
  expect(row(2)).toContainElement(header('2'))
  expect(row(3)).toContainElement(header('3'))
  expect(header('1')).toHaveAttribute('aria-expanded', 'false')
  expect(header('1')).toHaveTextContent('When on high')
  expect(header('2')).toHaveTextContent('2 variants')
  expect(panel('1')).toBeEmptyDOMElement()
  expect(panel('1')).not.toBeVisible()
  expect(editors()).toHaveLength(0)
  expect(source.loadLines).not.toHaveBeenCalled()
  expect(scrollIntoView).not.toHaveBeenCalled()
})

test('opening a row mounts the editor of that line only', async () => {
  const { source } = renderAccordion()
  await userEvent.click(header('2'))

  expect(header('2')).toHaveAttribute('aria-expanded', 'true')
  expect(header('1')).toHaveAttribute('aria-expanded', 'false')
  expect(panel('2')).toBeVisible()
  expect(await within(panel('2')).findByLabelText('Number')).toHaveValue('2')
  expect(editors()).toHaveLength(1)
  expect(
    within(row(2)).getByRole('group', {
      name: 'Editor for the line at position 2',
    }),
  ).toBeVisible()
  expect(source.loadLines.mock.calls).toEqual([[1, 1]])
})

test('closing a row unmounts its editor', async () => {
  renderAccordion()
  await openLoadedRow('2')
  await userEvent.click(header('2'))

  expect(header('2')).toHaveAttribute('aria-expanded', 'false')
  expect(panel('2')).toBeEmptyDOMElement()
  expect(editors()).toHaveLength(0)
})

test('several rows can be open at the same time', async () => {
  const { source } = renderAccordion()
  await openLoadedRow('1')
  await openLoadedRow('3')

  expect(editors()).toHaveLength(2)
  expect(within(panel('1')).getByLabelText('Number')).toHaveValue('1')
  expect(within(panel('3')).getByLabelText('Number')).toHaveValue('3')
  expect(header('2')).toHaveAttribute('aria-expanded', 'false')
  expect(source.loadLines.mock.calls).toEqual([
    [0, 1],
    [2, 1],
  ])
})

test('a draft survives closing and reopening its row', async () => {
  const { source, getState } = renderAccordion()
  await openLoadedRow('1')
  await userEvent.type(within(panel('1')).getByLabelText('Number'), 'a')

  expect(header('1')).toHaveTextContent('edited')
  expect(header('2')).not.toHaveTextContent('edited')

  await userEvent.click(header('1'))

  expect(editors()).toHaveLength(0)
  expect(header('1')).toHaveTextContent('edited')
  expect(getState().lines[0].draft?.number).toBe('1a')

  await userEvent.click(header('1'))

  expect(within(panel('1')).getByLabelText('Number')).toHaveValue('1a')
  expect(source.loadLines).toHaveBeenCalledTimes(1)
})

test('typing in an open row does not render the other rows', async () => {
  const isLineDirty = jest.spyOn(editLiteReducer, 'isLineDirty')
  renderAccordion()
  await openLoadedRow('2')
  isLineDirty.mockClear()
  await userEvent.type(within(panel('2')).getByLabelText('Number'), 'b')

  expect(isLineDirty).toHaveBeenCalled()
  expect(isLineDirty).not.toHaveBeenCalledWith(undefined)
})

test('a long chapter mounts only the editor of the initial line', async () => {
  const { source } = renderAccordion(150, { lines: buildEditLiteLines(170) })

  expect(await screen.findByLabelText('Number')).toHaveValue('151')
  expect(screen.getAllByRole('listitem')).toHaveLength(170)
  expect(editors()).toHaveLength(1)
  expect(source.loadLines.mock.calls).toEqual([[150, 1]])
  expect(scrollIntoView.mock.instances[0]).toBe(row(151))
})

test('the initial line starts open and is scrolled into view', async () => {
  const { source } = renderAccordion(1)

  expect(header('2')).toHaveAttribute('aria-expanded', 'true')
  expect(header('1')).toHaveAttribute('aria-expanded', 'false')
  expect(await within(panel('2')).findByLabelText('Number')).toHaveValue('2')
  expect(source.loadLines.mock.calls).toEqual([[1, 1]])
  expect(scrollIntoView.mock.calls).toEqual([
    [{ block: 'start', behavior: 'instant' }],
  ])
  expect(scrollIntoView.mock.instances[0]).toBe(row(2))
})

test('the initial line can be closed', async () => {
  renderAccordion(0)
  await within(panel('1')).findByLabelText('Number')
  await userEvent.click(header('1'))

  expect(editors()).toHaveLength(0)
  expect(scrollIntoView).toHaveBeenCalledTimes(1)
})

test.each([-1, 1.5, 3, Number.NaN])(
  'an initial line of %s opens nothing',
  (initialLine: number) => {
    const { source } = renderAccordion(initialLine)

    expect(editors()).toHaveLength(0)
    expect(scrollIntoView).not.toHaveBeenCalled()
    expect(source.loadLines).not.toHaveBeenCalled()
  },
)

test('opens the initial line where scrolling is not supported', async () => {
  Reflect.deleteProperty(window.HTMLElement.prototype, 'scrollIntoView')
  renderAccordion(2)

  await waitFor(() =>
    expect(within(panel('3')).getByLabelText('Number')).toHaveValue('3'),
  )
  expect(scrollIntoView).not.toHaveBeenCalled()
})

test('says so when the chapter has no lines', () => {
  renderAccordion(0, { lines: [] })

  expect(screen.getByText('This chapter has no lines.')).toBeVisible()
  expect(screen.queryByRole('list')).not.toBeInTheDocument()
  expect(scrollIntoView).not.toHaveBeenCalled()
})
