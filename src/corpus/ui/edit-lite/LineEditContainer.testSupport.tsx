import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  EditLiteRenderOptions,
  EditLiteRenderResult,
  renderWithEditLite,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { EditLiteState } from 'corpus/ui/edit-lite/editLiteState'
import LineEditContainer from 'corpus/ui/edit-lite/LineEditContainer'

export function renderContainer(
  options: EditLiteRenderOptions,
  index = 0,
): EditLiteRenderResult {
  return renderWithEditLite(
    (state: EditLiteState) => (
      <LineEditContainer index={index} lineState={state.lines[index]} />
    ),
    options,
  )
}

export function button(name: string): HTMLElement {
  return screen.getByRole('button', { name })
}

export async function renderLoadedContainer(
  options: EditLiteRenderOptions = {},
): Promise<EditLiteRenderResult> {
  const view = renderContainer(options)
  await screen.findByLabelText('Number')
  return view
}

export async function renderEditedContainer(
  options: EditLiteRenderOptions = {},
): Promise<EditLiteRenderResult> {
  const view = await renderLoadedContainer(options)
  await userEvent.type(screen.getByLabelText('Number'), 'a')
  return view
}
