import React from 'react'

export const editorState: { error: unknown } = { error: null }

type EditorMockProps = {
  name: string
  value: string
  disabled?: boolean
  error?: unknown
}

export function SpecialCharactersHelpMock(): null {
  return null
}

export function TemplateFormMock(): null {
  return null
}

export function EditorMock({
  name,
  value,
  disabled,
  error,
}: EditorMockProps): JSX.Element {
  if (name === 'transliteration') {
    editorState.error = error ?? null
  }
  return (
    <textarea aria-label={name} value={value} disabled={disabled} readOnly />
  )
}
