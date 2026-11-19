import React from 'react'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import _ from 'lodash'
import {
  buildEditLiteLines,
  EditLiteRenderOptions,
  EditLiteRenderResult,
  renderWithEditLite,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { EditLiteState } from 'corpus/ui/edit-lite/editLiteState'
import { button } from 'corpus/ui/edit-lite/LineEditContainer.testSupport'
import PagedLines from 'corpus/ui/edit-lite/PagedLines'

export interface PagedLinesRenderOptions extends EditLiteRenderOptions {
  readonly initialLine?: number
  readonly initialPageSize?: number
}

export const lineCount = 62

export function renderPagedLines({
  initialLine,
  initialPageSize,
  ...options
}: PagedLinesRenderOptions): EditLiteRenderResult {
  return renderWithEditLite(
    (state: EditLiteState) => (
      <PagedLines
        state={state}
        initialLine={initialLine}
        initialPageSize={initialPageSize}
      />
    ),
    { lines: buildEditLiteLines(lineCount), ...options },
  )
}

export async function waitForLoadedPage(): Promise<void> {
  await waitFor(() =>
    expect(screen.queryByText('Loading line...')).not.toBeInTheDocument(),
  )
}

export async function renderLoadedPagedLines(
  options: PagedLinesRenderOptions = {},
): Promise<EditLiteRenderResult> {
  const view = renderPagedLines(options)
  await waitForLoadedPage()
  return view
}

export function headings(first: number, last: number): string[] {
  return _.range(first, last + 1).map((lineNumber) => `Line ${lineNumber}`)
}

export function headingsOnPage(): (string | null)[] {
  return within(screen.getByRole('list', { name: 'Lines on this page' }))
    .getAllByRole('heading')
    .map((heading) => heading.textContent)
}

export function lineHeading(lineNumber: string): HTMLElement {
  return screen.getByRole('heading', { name: `Line ${lineNumber}` })
}

export function lineEditor(position: number): HTMLElement {
  return screen.getByRole('group', {
    name: `Editor for the line at position ${position}`,
  })
}

export function queryTargetLine(): HTMLElement | null {
  return screen.queryByRole('listitem', { current: 'location' })
}

export async function changePage(name: 'Previous' | 'Next'): Promise<void> {
  await userEvent.click(button(name))
  await waitForLoadedPage()
}

export async function changePageSize(pageSize: number): Promise<void> {
  await userEvent.selectOptions(
    screen.getByRole('combobox', { name: 'Lines per page' }),
    `${pageSize}`,
  )
  await waitForLoadedPage()
}

export async function goToLine(lineNumber: string): Promise<void> {
  const input = screen.getByRole('textbox', { name: 'Go to line' })
  await userEvent.clear(input)
  await userEvent.type(input, lineNumber)
  await userEvent.click(button('Go'))
  await waitForLoadedPage()
}
