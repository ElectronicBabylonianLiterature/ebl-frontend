import React, { Component, useState, useRef } from 'react'
import { Popover, Overlay, ButtonToolbar } from 'react-bootstrap'
import _ from 'lodash'
import LemmatizationForm from './LemmatizationForm'
import Word from './Word'

import './WordLemmatizer.css'
import { LemmatizationToken } from 'fragmentarium/domain/Lemmatization'

interface Props {
  fragmentService
  token: LemmatizationToken
  onChange
}

export default function WordLemmatizer({
  fragmentService,
  token,
  onChange
}: Props): JSX.Element {
  const [show, setShow] = useState(false)
  const target = useRef(null)
  const popOverId = _.uniqueId('LemmatizationPopOver-')

  const handleClick = (): void => {
    setShow(!show)
  }

  const hide = (): void => {
    setShow(false)
  }

  const handleCange = (uniqueLemma): void => {
    onChange(uniqueLemma)
    hide()
  }

  return (
    <span ref={target} className="WordLemmatizer">
      <Word token={token} onClick={handleClick} />
      <Overlay
        rootClose
        onHide={hide}
        show={show}
        target={target.current as any}
        placement="top"
      >
        <Popover
          id={popOverId}
          title="Lemmatize"
          className="WordLemmatizer__form"
        >
          <Popover.Content>
            <LemmatizationForm
              token={token}
              fragmentService={fragmentService}
              onChange={handleCange}
            />
          </Popover.Content>
        </Popover>
      </Overlay>
    </span>
  )
}
