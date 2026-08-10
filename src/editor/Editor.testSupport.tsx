import React from 'react'

export interface EditorMockProps {
  name: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

const recordedEditorProps: Record<string, Record<string, unknown>> = {}

export function resetEditorMock(): void {
  Object.keys(recordedEditorProps).forEach(
    (name) => delete recordedEditorProps[name],
  )
}

export function editorErrorOf(name: string): unknown {
  return recordedEditorProps[name]?.error ?? null
}

export default function EditorMock({
  name,
  value,
  onChange,
  disabled,
  ...rest
}: EditorMockProps & Record<string, unknown>): JSX.Element {
  recordedEditorProps[name] = rest
  return (
    <textarea
      aria-label={name}
      value={value}
      disabled={disabled}
      onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
        onChange(event.target.value)
      }
      {...rest}
    />
  )
}
