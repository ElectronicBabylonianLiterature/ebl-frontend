import React from 'react'

export const editorState: { error: unknown } = { error: null }

type EditorMockProps = {
  name: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

type TemplateFormMockProps = {
  onSubmit: (templateValue: string) => void
}

export function SpecialCharactersHelpMock(): null {
  return null
}

export function TemplateFormMock({
  onSubmit,
}: TemplateFormMockProps): JSX.Element {
  return (
    <button onClick={() => onSubmit('template value')} type="button">
      Apply template
    </button>
  )
}

export function EditorMock({
  name,
  value,
  onChange,
  disabled,
  ...rest
}: EditorMockProps & Record<string, unknown>): JSX.Element {
  if (name === 'transliteration') {
    editorState.error = rest.error ?? null
  }
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
