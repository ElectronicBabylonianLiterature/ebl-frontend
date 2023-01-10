import React, { useState } from 'react'
import LemmatizationForm from './LemmatizationForm'
import Word from './Word'

import './WordLemmatizer.css'
import {
  LemmatizationToken,
  UniqueLemma,
} from 'transliteration/domain/Lemmatization'
import FragmentService from 'fragmentarium/application/FragmentService'
import ModalButton from 'common/ModalButton'
import { Col, Form } from 'react-bootstrap'
import _ from 'lodash'

interface Props {
  fragmentService: FragmentService
  token: LemmatizationToken
  onChange: (uniqueLemma: UniqueLemma) => void
  defaultIsMulti?: boolean
}

export default function WordLemmatizer({
  fragmentService,
  token,
  onChange,
}: Props): JSX.Element {
  const uniqueLemma = token.uniqueLemma ?? []

  const [show, setShow] = useState(false)
  const [isMulti, setIsMulti] = useState(uniqueLemma.length > 1)

  const handleChange = (uniqueLemma: UniqueLemma): void => {
    onChange(uniqueLemma)
    setShow(false)
  }

  const LemmaToggle = <Word token={token} />

  function Checkbox(): JSX.Element {
    return (
      <Form.Group controlId={_.uniqueId('LemmatizationForm-Complex-')}>
        <Form.Check
          type="checkbox"
          label="Complex"
          disabled={uniqueLemma.length > 1}
          checked={isMulti}
          onChange={(): void => setIsMulti(!isMulti)}
        />
      </Form.Group>
    )
  }

  const LemmaMenu = (isMulti: boolean): JSX.Element => {
    return (
      <Form className="WordLemmatizer__form">
        <Form.Row>
          <Col md={9}>
            <LemmatizationForm
              uniqueLemma={token.uniqueLemma}
              suggestions={token.suggestions}
              fragmentService={fragmentService}
              onChange={handleChange}
              isMulti={isMulti}
            />
          </Col>
          <Col md={3}>
            <Checkbox />
          </Col>
        </Form.Row>
      </Form>
    )
  }
  return token.lemmatizable ? (
    <ModalButton
      onToggle={setShow}
      show={show}
      toggle={LemmaToggle}
      dialog={LemmaMenu(isMulti)}
    />
  ) : (
    <span className="Word">{token.value}</span>
  )
}
