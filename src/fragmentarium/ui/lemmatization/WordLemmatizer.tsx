import React, { useState, CSSProperties } from 'react'
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

  const hide = (): void => {
    setShow(false)
  }

  const handleCange = (uniqueLemma): void => {
    onChange(uniqueLemma)
    hide()
  }

  interface LemmaToggleProps {
    onClick(): unknown
  }
  const LemmaToggle = React.forwardRef<HTMLButtonElement & Button, any>(
    function toggle({ onClick }: LemmaToggleProps, ref) {
      return <Word ref={ref} token={token} onClick={onClick} active={show} />
    }
  )

  interface LemmaMenuProps {
    style?: CSSProperties
    className?: string | undefined
    'aria-labelledby'?: string | undefined
  }
  const LemmaMenu = React.forwardRef<HTMLDivElement, LemmaMenuProps>(
    function menu(
      { style, className, 'aria-labelledby': labeledBy }: LemmaMenuProps,
      ref
    ) {
      return (
        <div
          ref={ref}
          style={style}
          className={className}
          aria-labelledby={labeledBy}
        >
          <div className="WordLemmatizer__form">
            <LemmatizationForm
              token={token}
              fragmentService={fragmentService}
              onChange={handleCange}
            />
          </div>
        </div>
      )
    }
  )

  return (
    <Dropdown as="span" onToggle={setShow} show={show}>
      <Dropdown.Toggle as={LemmaToggle} id={toggleId} />
      <Dropdown.Menu as={LemmaMenu} />
    </Dropdown>
  )
}
