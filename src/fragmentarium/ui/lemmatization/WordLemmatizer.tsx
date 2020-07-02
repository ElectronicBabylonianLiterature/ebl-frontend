import React, { useState } from 'react'
import { Button, Dropdown } from 'react-bootstrap'
import _ from 'lodash'
import LemmatizationForm from './LemmatizationForm'
import Word from './Word'

import './WordLemmatizer.css'
import { LemmatizationToken } from 'transliteration/domain/Lemmatization'

interface Props {
  fragmentService
  token: LemmatizationToken
  onChange
}

export default function WordLemmatizer({
  fragmentService,
  token,
  onChange,
}: Props): JSX.Element {
  const [show, setShow] = useState(false)
  const toggleId = _.uniqueId('LemmatizationToggle-')

  const handleCange = (uniqueLemma): void => {
    onChange(uniqueLemma)
    setShow(false)
  }

  const LemmaToggle = React.forwardRef<HTMLButtonElement & Button, unknown>(
    function toggle(props, ref) {
      return (
        <Button ref={ref} size="sm" variant="outline-dark" {...props}>
          <Word token={token} />
        </Button>
      )
    }
  )

  const LemmaMenu = React.forwardRef<HTMLDivElement, unknown>(function menu(
    props,
    ref
  ) {
    return (
      <div ref={ref} {...props}>
        <LemmatizationForm
          token={token}
          fragmentService={fragmentService}
          onChange={handleCange}
        />
      </div>
    )
  })

  return token.lemmatizable ? (
    <Dropdown as="span" onToggle={setShow} show={show}>
      <Dropdown.Toggle
        as={LemmaToggle}
        id={toggleId}
        bsPrefix="WordLemmatizer__toggle"
      />
      <Dropdown.Menu as={LemmaMenu} />
    </Dropdown>
  ) : (
    <span className="Word">{token.value}</span>
  )
}
