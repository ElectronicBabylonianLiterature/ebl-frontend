import React from 'react'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  EditLiteRenderOptions,
  EditLiteRenderResult,
  renderWithEditLite,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { EditLiteState } from 'corpus/ui/edit-lite/editLiteState'
import SplitLines from 'corpus/ui/edit-lite/SplitLines'

export function renderSplit(
  initialLine?: number,
  options: EditLiteRenderOptions = {},
): EditLiteRenderResult {
  return renderWithEditLite(
    (state: EditLiteState) => (
      <SplitLines state={state} initialLine={initialLine} />
    ),
    options,
  )
}

export function listbox(): HTMLElement {
  return screen.getByRole('listbox', { name: 'Lines' })
}

export function options(): HTMLElement[] {
  return within(listbox()).getAllByRole('option')
}

export function selectedOptions(): HTMLElement[] {
  return within(listbox()).getAllByRole('option', { selected: true })
}

export function editors(): HTMLElement[] {
  return screen.queryAllByRole('group', { name: /^Editor for the line/ })
}

export function button(name: string): HTMLElement {
  return screen.getByRole('button', { name })
}

export function deleteDialog(): HTMLElement {
  return screen.getByRole('dialog', { name: 'Delete line' })
}

export async function confirmDeletion(): Promise<void> {
  await userEvent.click(
    within(deleteDialog()).getByRole('button', { name: 'Delete line' }),
  )
}

export async function deleteSelectedLine(): Promise<void> {
  await userEvent.click(button('Delete line'))
  await confirmDeletion()
}

async function loadedRegion(name: string): Promise<HTMLElement> {
  const editor = screen.getByRole('region', { name })
  await within(editor).findByLabelText('Number')
  return editor
}

export function loadedEditor(lineNumber: string): Promise<HTMLElement> {
  return loadedRegion(`Line ${lineNumber}`)
}

export function loadedNewLineEditor(): Promise<HTMLElement> {
  return loadedRegion('New line')
}

export async function typeIntoNumber(
  lineNumber: string,
  text: string,
): Promise<void> {
  const editor = await loadedEditor(lineNumber)
  await userEvent.type(within(editor).getByLabelText('Number'), text)
}

export function optionNumbers(): string[] {
  return options().map((option) =>
    String(option.querySelector('.edit-lite-summary__number')?.textContent),
  )
}

export async function waitForOrder(numbers: readonly string[]): Promise<void> {
  await waitFor(() => expect(optionNumbers()).toEqual(numbers))
}

export async function expectEditedLineStillSelected(
  lineNumber: string,
  index: number,
  lineCount: number,
  numberInput: HTMLElement,
): Promise<void> {
  await userEvent.keyboard('y')
  const editor = await loadedEditor(lineNumber)

  expect(selectedOptions()).toEqual([options()[index]])
  expect(selectedOptions()[0]).toHaveTextContent(
    new RegExp(`^${lineNumber}.*edited$`),
  )
  expect(screen.getAllByText('edited')).toHaveLength(1)
  expect(within(editor).getByLabelText('Number')).toBe(numberInput)
  expect(numberInput).toHaveFocus()
  expect(numberInput).toHaveValue(`${lineNumber}xy`)
  expect(
    within(editor).getByText(`${index + 1} of ${lineCount}`),
  ).toBeInTheDocument()
}

export const moveButtonNames: readonly string[] = [
  'Move up',
  'Move down',
  'Move to...',
]

export function listEnabledMoveButtons(): string[] {
  return moveButtonNames.filter(
    (name) => !button(name).hasAttribute('disabled'),
  )
}

export async function moveSelectedLineTo(place: string): Promise<void> {
  await userEvent.click(button('Move to...'))
  const dialog = within(screen.getByRole('dialog', { name: 'Move line' }))
  await userEvent.selectOptions(dialog.getByRole('combobox'), place)
  await userEvent.click(dialog.getByRole('button', { name: 'Move line' }))
}

export async function pressKeys(
  keys: string,
  lineNumber: string,
): Promise<void> {
  await userEvent.keyboard(keys)
  await loadedEditor(lineNumber)
}
