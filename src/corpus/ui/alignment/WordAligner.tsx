import React, { useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import _ from 'lodash'
import Word from './Word'

import './WordAligner.css'
import produce, { Draft } from 'immer'

import { Token } from 'transliteration/domain/token'
import { AlignmentToken } from 'corpus/domain/alignment'
import DropdownButton from 'common/DropdownButton'

interface FormProps {
  readonly token: AlignmentToken
  readonly reconstructionTokens: ReadonlyArray<Token>
  readonly onChange: (token: AlignmentToken) => void
}

function AlignmentForm(props: FormProps) {
  const [alignment, setAlignment] = useState(props.token.alignment)
  const [variant, setVariant] = useState(props.token.variant)

  const onClick = () => {
    props.onChange(
      produce(props.token, (draft: Draft<AlignmentToken>) => {
        if (_.isNil(alignment)) {
          return {
            value: draft.value,
            alignment: null,
          }
        } else {
          const token = props.reconstructionTokens[alignment]
          draft.alignment = alignment
          draft.variant = variant
          if (token.type === 'AkkadianWord' || token.type === 'Word') {
            draft.language = token.language
            draft.isNormalized = token.normalized
          }
        }
      })
    )
  }

  const handleAlignmentChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const alignmentIndex = event.target.value
    if (/\d+/.test(alignmentIndex)) {
      setAlignment(Number(alignmentIndex))
    } else {
      setAlignment(null)
    }
  }

  const handleVariantChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVariant(event.target.value)
  }

  return (
    <div className="WordAligner__form">
      <Form.Group controlId={_.uniqueId('WordAligner-Select-')}>
        <Form.Label>Ideal word</Form.Label>
        <Form.Control
          as="select"
          value={String(alignment)}
          onChange={handleAlignmentChange}
        >
          <option value="">--</option>
          {props.reconstructionTokens.map((reconstructionToken, index) =>
            ['AkkadianWord', 'Word'].includes(reconstructionToken.type) ? (
              <option key={index} value={index}>
                {' '}
                {reconstructionToken.value}
              </option>
            ) : null
          )}
        </Form.Control>
      </Form.Group>
      <Form.Group controlId={_.uniqueId('WordAligner-Select-')}>
        <Form.Label>Variant</Form.Label>
        <Form.Control
          as="input"
          value={variant}
          onChange={handleVariantChange}
        />
      </Form.Group>
      <Button onClick={onClick}>Set alignment</Button>
    </div>
  )
}

interface AlignerProps {
  readonly token: AlignmentToken
  readonly reconstructionTokens: ReadonlyArray<Token>
  readonly onChange: (token: AlignmentToken) => void
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
    <DropdownButton
      onToggle={setShow}
      show={show}
      toggle={toggle}
      menu={menu}
    />
  )
}
