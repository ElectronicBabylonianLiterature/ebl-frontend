import React from 'react'
import { Button, Form } from 'react-bootstrap'
import { AlignmentToken } from 'corpus/domain/alignment'
import { useAlignmentInput } from 'corpus/ui/alignment/WordAligner'
import { WordFlow } from 'corpus/ui/edit-lite/useWordFlow'
import { handleWordKeys, useFieldFocus } from 'corpus/ui/edit-lite/wordKeys'
import { Token } from 'transliteration/domain/token'

interface Props {
  readonly token: AlignmentToken
  readonly reconstructionTokens: readonly Token[]
  readonly flow: WordFlow
  readonly onChange: (token: AlignmentToken) => void
  readonly onClose: () => void
}

export default function AlignmentWordForm({
  token,
  reconstructionTokens,
  flow,
  onChange,
  onClose,
}: Props): JSX.Element {
  const { fields, createToken } = useAlignmentInput(token, reconstructionTokens)
  const { fieldsRef } = useFieldFocus(null)
  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault()
    onChange(createToken())
    onClose()
  }
  const handleKeyDown = (event: React.KeyboardEvent): void =>
    handleWordKeys(event, {
      accept: (): void => {
        onChange(createToken())
        flow.next()
      },
      next: flow.next,
      previous: flow.previous,
    })

  return (
    <Form className="WordAligner__form" onSubmit={handleSubmit}>
      <div ref={fieldsRef} onKeyDown={handleKeyDown}>
        {fields}
      </div>
      <Button type="submit" size="sm">
        Set alignment
      </Button>
    </Form>
  )
}
