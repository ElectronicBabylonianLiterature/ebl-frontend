import React, { useState } from 'react'
import LemmatizationForm from './LemmatizationForm'
import Word from './Word'

import './WordLemmatizer.css'
import {
  LemmatizationToken,
  UniqueLemma,
} from 'transliteration/domain/Lemmatization'
import FragmentService from 'fragmentarium/application/FragmentService'
import DropdownButton from 'common/DropdownButton'

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

  const handleCange = (uniqueLemma: UniqueLemma): void => {
    onChange(uniqueLemma)
    setShow(false)
  }

  const LemmaToggle = <Word token={token} />

  const LemmaMenu = (
    <LemmatizationForm
      token={token}
      fragmentService={fragmentService}
      onChange={handleCange}
    />
  )

  return token.lemmatizable ? (
    <DropdownButton
      onToggle={setShow}
      show={show}
      toggle={LemmaToggle}
      menu={LemmaMenu}
    />
  ) : (
    <span className="Word">{token.value}</span>
  )
}
