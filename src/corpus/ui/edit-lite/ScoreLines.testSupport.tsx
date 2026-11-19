import React from 'react'
import { screen, within } from '@testing-library/react'
import {
  EditLiteRenderOptions,
  EditLiteRenderResult,
  renderWithEditLite,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { EditLiteState } from 'corpus/ui/edit-lite/editLiteState'
import ScoreLines from 'corpus/ui/edit-lite/ScoreLines'

export function renderScore(
  options: EditLiteRenderOptions = {},
): EditLiteRenderResult {
  return renderWithEditLite(
    (state: EditLiteState) => <ScoreLines state={state} />,
    options,
  )
}

export function block(lineNumber: string): HTMLElement {
  return screen.getByRole('button', { name: new RegExp(`^${lineNumber} `) })
}

export function editing(lineNumber: string): HTMLElement {
  return screen.getByRole('group', { name: `Editing line ${lineNumber}` })
}

export function editingButton(lineNumber: string, name: string): HTMLElement {
  return within(editing(lineNumber)).getByRole('button', { name })
}

export function editors(): HTMLElement[] {
  return screen.queryAllByRole('group', { name: /^Editor for the line/ })
}

export async function renderLoadedScore(
  options: EditLiteRenderOptions = {},
): Promise<EditLiteRenderResult> {
  const view = renderScore(options)
  await within(block('3')).findByText('8. ap-su-um-ma')
  return view
}
