import React from 'react'

export default function TemplateFormMock({
  onSubmit,
}: {
  onSubmit: (templateValue: string) => void
}): JSX.Element {
  return (
    <button onClick={() => onSubmit('template value')} type="button">
      Apply template
    </button>
  )
}
