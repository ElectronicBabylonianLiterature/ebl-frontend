import React from 'react'
import NumberSearchForm from './search/NumberSearchForm'
import TransliterationSearchForm from './search/TransliterationSearchForm'
import RandomButton from './RandomButton'
import PioneersButton from './PioneersButton'

import './SearchGroup.css'

export default function SearchGroup({
  number,
  transliteration,
  fragmentService
}) {
  return (
    <>
      <NumberSearchForm number={number} />
      <TransliterationSearchForm transliteration={transliteration} />
      <div className="SearchGroup__button-bar">
        <RandomButton fragmentService={fragmentService} method="random">
          I'm feeling lucky
        </RandomButton>{' '}
        <PioneersButton fragmentService={fragmentService} />
      </div>
    </>
  )
}
