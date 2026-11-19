import React from 'react'
import { screen, within } from '@testing-library/react'
import {
  buildEditLiteLines,
  EditLiteRenderResult,
  renderWithEditLite,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  EditLiteParameters,
  parseEditLiteParameters,
} from 'corpus/ui/edit-lite/editLiteParameters'
import { EditLiteState } from 'corpus/ui/edit-lite/editLiteState'
import {
  headingsOnPage,
  queryTargetLine,
  waitForLoadedPage,
} from 'corpus/ui/edit-lite/PagedLines.testSupport'
import {
  loadedEditor,
  selectedOptions,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'
import VariantLines from 'corpus/ui/edit-lite/VariantLines'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

const lineCount = 30
const scoreHint =
  'Select a line to edit it. Manuscript lines load as you scroll.'

function renderLines(search: string): EditLiteRenderResult {
  const parameters: EditLiteParameters = parseEditLiteParameters(search)
  return renderWithEditLite(
    (state: EditLiteState) => (
      <VariantLines state={state} parameters={parameters} />
    ),
    { lines: buildEditLiteLines(lineCount) },
  )
}

function accordion(): HTMLElement {
  return screen.getByRole('list', { name: 'Lines' })
}

function openHeaders(): HTMLElement[] {
  return within(accordion()).queryAllByRole('button', { expanded: true })
}

function pageSizeSelect(): HTMLElement {
  return screen.getByRole('combobox', { name: 'Lines per page' })
}

describe('accordion', () => {
  test('is shown by default with every line closed', () => {
    renderLines('')

    expect(within(accordion()).getAllByRole('listitem')).toHaveLength(lineCount)
    expect(openHeaders()).toHaveLength(0)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(screen.queryByTestId('edit-lite-paged')).not.toBeInTheDocument()
    expect(screen.queryByText(scoreHint)).not.toBeInTheDocument()
  })

  test('opens the line with the requested number', async () => {
    const view = renderLines('?variant=accordion&line=14')

    expect(await screen.findByLabelText('Number')).toHaveValue('14')
    expect(openHeaders()).toHaveLength(1)
    expect(openHeaders()[0]).toHaveAccessibleName(/^14 /)
    expect(view.source.loadLines).toHaveBeenCalledTimes(1)
    expect(view.source.loadLines).toHaveBeenCalledWith(13, 1)
  })

  test('opens nothing for a line number that does not exist', () => {
    const view = renderLines('?line=99')

    expect(openHeaders()).toHaveLength(0)
    expect(view.source.loadLines).not.toHaveBeenCalled()
  })
})

describe('pages', () => {
  test('shows the first page with the default size', async () => {
    renderLines('?variant=pages')
    await waitForLoadedPage()

    expect(screen.getByTestId('edit-lite-paged')).toBeInTheDocument()
    expect(screen.getByText('Lines 1–10 of 30')).toBeInTheDocument()
    expect(pageSizeSelect()).toHaveValue('10')
    expect(queryTargetLine()).not.toBeInTheDocument()
    expect(
      screen.queryByRole('list', { name: 'Lines' }),
    ).not.toBeInTheDocument()
  })

  test('starts on the page of the requested line with the requested size', async () => {
    const view = renderLines('?variant=pages&size=25&line=27')
    await waitForLoadedPage()

    expect(screen.getByText('Lines 26–30 of 30')).toBeInTheDocument()
    expect(pageSizeSelect()).toHaveValue('25')
    expect(headingsOnPage()).toHaveLength(5)
    expect(queryTargetLine()).toHaveTextContent(/^Line 27/)
    expect(view.source.loadLines).toHaveBeenCalledWith(25, 5)
  })

  test('starts on the first page for a line number that does not exist', async () => {
    renderLines('?variant=pages&line=99')
    await waitForLoadedPage()

    expect(screen.getByText('Lines 1–10 of 30')).toBeInTheDocument()
    expect(queryTargetLine()).not.toBeInTheDocument()
  })
})

describe('split view', () => {
  test('selects the first line', async () => {
    renderLines('?variant=split')
    await loadedEditor('1')

    expect(selectedOptions()).toHaveLength(1)
    expect(selectedOptions()[0]).toHaveTextContent(/^1%n/)
    expect(
      screen.queryByRole('list', { name: 'Lines' }),
    ).not.toBeInTheDocument()
  })

  test('selects the line with the requested number', async () => {
    const view = renderLines('?variant=split&line=14')
    const editor = await loadedEditor('14')

    expect(within(editor).getByLabelText('Number')).toHaveValue('14')
    expect(selectedOptions()[0]).toHaveTextContent(/^14%n/)
    expect(view.source.loadLines).toHaveBeenCalledWith(12, 3)
  })

  test('selects the first line for a line number that does not exist', async () => {
    renderLines('?variant=split&line=99')

    expect(await loadedEditor('1')).toBeInTheDocument()
  })
})

describe('inline score', () => {
  test('shows the whole chapter as a static score', async () => {
    const view = renderLines('?variant=score&line=14')

    expect(screen.getByText(scoreHint)).toBeInTheDocument()
    expect(await screen.findByText('o 30. kur 30')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /^\d+ / })).toHaveLength(
      lineCount,
    )
    expect(view.source.loadLines).toHaveBeenCalledTimes(1)
    expect(view.source.loadLines).toHaveBeenCalledWith(0, lineCount)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Number')).not.toBeInTheDocument()
  })
})
