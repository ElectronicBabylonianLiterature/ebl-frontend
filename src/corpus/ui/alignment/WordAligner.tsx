import React, { useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import _ from 'lodash'
import Word from 'corpus/ui/alignment/Word'

import 'corpus/ui/alignment/WordAligner.css'

import { Token } from 'transliteration/domain/token'
import { alignToken, AlignmentToken } from 'corpus/domain/alignment'
import ModalButton from 'common/ui/ModalButton'
import { isAnyWord } from 'transliteration/domain/type-guards'

interface AlignerProps {
  readonly token: AlignmentToken
  readonly reconstructionTokens: ReadonlyArray<Token>
  readonly onChange: (token: AlignmentToken) => void
}

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
      <Form.Group as={Col} controlId={_.uniqueId('WordAligner-Select-')}>
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
      <Form.Group as={Col} controlId={_.uniqueId('WordAligner-Select-')}>
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

function AlignmentForm(props: AlignerProps) {
  const { fields, createToken } = useAlignmentInput(
    props.token,
    props.reconstructionTokens,
  )

  return (
    <Form className="WordAligner__form">
      {fields}
      <Button onClick={() => props.onChange(createToken())}>
        Set alignment
      </Button>
    </Form>
  )
}

export default function WordAligner({
  token,
  reconstructionTokens,
  onChange,
}: AlignerProps): JSX.Element {
  const [show, setShow] = useState(false)

  const handleChange = (value: AlignmentToken): void => {
    onChange(value)
    setShow(false)
  }

  const toggle = (
    <Word token={token} reconstructionTokens={reconstructionTokens} />
  )

  const menu = (
    <AlignmentForm
      token={token}
      reconstructionTokens={reconstructionTokens}
      onChange={handleChange}
    />
  )

  return (
    <ModalButton onToggle={setShow} show={show} toggle={toggle} dialog={menu} />
  )
}
