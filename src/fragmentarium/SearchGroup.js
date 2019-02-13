import React from 'react'
import NumberSearchForm from './search/NumberSearchForm'
import TransliterationSearchForm from './search/TransliterationSearchForm'
import RandomButton from './RandomButton'
import PioneersButton from './PioneersButton'

import './Fragmentarium.css'

export default function SearchGroup ({ number, transliteration, fragmentService }) {
  return (
    <>
      <NumberSearchForm number={number} />
      <TransliterationSearchForm transliteration={transliteration} />
      <div className='Fragmentarium-search__button-bar'>
        <RandomButton fragmentService={fragmentService} method='random'>
                I'm feeling lucky
        </RandomButton>
        {' '}
        <PioneersButton fragmentService={fragmentService} />
      </div>
    </>
  )
}
