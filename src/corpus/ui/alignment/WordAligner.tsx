import React, { useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import _ from 'lodash'
import Word from './Word'

import './WordAligner.css'

import { Token } from 'transliteration/domain/token'
import { AlignmentToken } from 'corpus/domain/alignment'
import ModalButton from 'common/ModalButton'
import { isAnyWord } from 'transliteration/domain/type-guards'

interface AlignerProps {
  readonly token: AlignmentToken
  readonly reconstructionTokens: ReadonlyArray<Token>
  readonly onChange: (token: AlignmentToken) => void
}

function AlignmentForm(props: AlignerProps) {
  const [alignment, setAlignment] = useState(props.token.alignment)
  const [variant, setVariant] = useState(props.token.variant?.value ?? '')

  function updateToken(alignmentToken: AlignmentToken): AlignmentToken {
    const token = !_.isNil(alignment) && props.reconstructionTokens[alignment]
    return token && isAnyWord(token)
      ? {
          value: alignmentToken.value,
          alignment: alignment,
          variant: variant
            ? {
                value: variant,
                type: token.type,
                language: token.language,
              }
            : null,
          isAlignable: true,
          suggested: false,
        }
      : {
          value: alignmentToken.value,
          alignment: null,
          variant: null,
          isAlignable: true,
          suggested: false,
        }
  }

  const onClick = () => props.onChange(updateToken(props.token))

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

  return (
    <Form className="WordAligner__form">
      <Row>
        <Form.Group as={Col} controlId={_.uniqueId('WordAligner-Select-')}>
          <Form.Label>Ideal word</Form.Label>
          <Form.Control
            as="select"
            value={String(alignment)}
            onChange={handleAlignmentChange}
          >
            <option value="">--</option>
            {props.reconstructionTokens.map((reconstructionToken, index) =>
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
      <Button onClick={onClick}>Set alignment</Button>
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
