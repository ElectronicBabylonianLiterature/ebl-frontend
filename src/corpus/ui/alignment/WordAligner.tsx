import React, { useId, useState } from 'react'
import { Col, Form, Row } from 'react-bootstrap'

import 'corpus/ui/alignment/WordAligner.css'

import { Token } from 'transliteration/domain/token'
import { alignToken, AlignmentToken } from 'corpus/domain/alignment'
import { isAnyWord } from 'transliteration/domain/type-guards'

interface AlignmentInput {
  readonly fields: JSX.Element
  readonly createToken: () => AlignmentToken
}

export function useAlignmentInput(
  token: AlignmentToken,
  reconstructionTokens: ReadonlyArray<Token>,
): AlignmentInput {
  const [alignment, setAlignment] = useState(token.alignment)
  const [variant, setVariant] = useState(token.variant?.value ?? '')
  const fieldId = useId()

  const handleAlignmentChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const alignmentIndex = event.currentTarget.value
    const alignmnet = /\d+/.test(alignmentIndex) ? Number(alignmentIndex) : null
    setAlignment(alignmnet)
  }

  const handleVariantChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVariant(event.target.value)
  }

  const fields = (
    <Row>
      <Form.Group as={Col} controlId={`${fieldId}-alignment`}>
        <Form.Label>Ideal word</Form.Label>
        <Form.Control
          as="select"
          value={String(alignment)}
          onChange={handleAlignmentChange}
        >
          <option value="">--</option>
          {reconstructionTokens.map((reconstructionToken, index) =>
            isAnyWord(reconstructionToken) ? (
              <option key={index} value={index}>
                {' '}
                {reconstructionToken.value}
              </option>
            ) : null,
          )}
        </Form.Control>
      </Form.Group>
      <Form.Group as={Col} controlId={`${fieldId}-variant`}>
        <Form.Label>Variant</Form.Label>
        <Form.Control
          as="input"
          value={variant}
          onChange={handleVariantChange}
        />
      </Form.Group>
    </Row>
  )

  return {
    fields,
    createToken: () =>
      alignToken(token, reconstructionTokens, alignment ?? null, variant),
  }
}
