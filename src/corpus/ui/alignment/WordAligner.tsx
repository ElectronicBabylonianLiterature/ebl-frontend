import React, { useState } from 'react'
import { Form } from 'react-bootstrap'
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
  readonly onChange: (token: AlignmentToken, shouldClose: boolean) => void
}

function AlignmentForm(props: FormProps) {
  const handleAlignmentChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    props.onChange(
      produce(props.token, (draft: Draft<AlignmentToken>) => {
        const alignmentIndex = event.target.value
        if (/\d+/.test(alignmentIndex)) {
          const token = props.reconstructionTokens[Number(alignmentIndex)]
          draft.alignment = Number(alignmentIndex)
          if (token.type === 'AkkadianWord' || token.type === 'Word') {
            draft.language = token.language
            draft.isNormalized = token.normalized
          }
        } else {
          return {
            value: draft.value,
            alignment: null,
          }
        }
      }),
      true
    )
  }

  const handleVariantChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange(
      produce(props.token, (draft: Draft<AlignmentToken>) => {
        draft.variant = event.target.value
      }),
      false
    )
  }

  return (
    <div className="WordAligner__form">
      <Form.Group controlId={_.uniqueId('WordAligner-Select-')}>
        <Form.Label>Ideal word</Form.Label>
        <Form.Control
          as="select"
          value={String(props.token.alignment)}
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
          value={props.token.variant}
          onChange={handleVariantChange}
        />
      </Form.Group>
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

  const handleChange = (value: AlignmentToken, shouldClose: boolean): void => {
    onChange(value)
    if (shouldClose) {
      setShow(false)
    }
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
