import React, { useState } from 'react'
import { Button, Dropdown } from 'react-bootstrap'
import _ from 'lodash'
import LemmatizationForm from './LemmatizationForm'
import Word from './Word'

import './WordLemmatizer.css'
import {
  LemmatizationToken,
  UniqueLemma,
} from 'transliteration/domain/Lemmatization'
import FragmentService from 'fragmentarium/application/FragmentService'

interface Props {
  fragmentService: FragmentService
  token: LemmatizationToken
  onChange: (uniqueLemma: UniqueLemma) => void
}

export default function WordLemmatizer({
  fragmentService,
  token,
  onChange,
}: Props): JSX.Element {
  const [show, setShow] = useState(false)
  const toggleId = _.uniqueId('LemmatizationToggle-')

  const handleCange = (uniqueLemma: UniqueLemma): void => {
    onChange(uniqueLemma)
    setShow(false)
  }

  const LemmaToggle = React.forwardRef<HTMLButtonElement & Button, unknown>(
    function toggle(props, ref) {
      return (
        <Button
          ref={ref}
          size="sm"
          variant="outline-dark"
          active={show}
          {...props}
        >
          <Word token={token} />
        </Button>
      )
    }
  )

  const LemmaMenu = React.forwardRef<HTMLDivElement, unknown>(function menu(
    {
      style,
      className,
      'aria-labelledby': labeledBy,
    }: {
      children?: React.ReactNode
      style?: React.CSSProperties
      className?: string
      'aria-labelledby'?: string
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        style={style}
        className={className}
        aria-labelledby={labeledBy}
      >
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
