import React from 'react'
import { screen, within } from '@testing-library/react'
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

export async function loadedEditor(lineNumber: string): Promise<HTMLElement> {
  const editor = screen.getByRole('region', { name: `Line ${lineNumber}` })
  await within(editor).findByLabelText('Number')
  return editor
}

export async function pressKeys(
  keys: string,
  lineNumber: string,
): Promise<void> {
  await userEvent.keyboard(keys)
  await loadedEditor(lineNumber)
}
