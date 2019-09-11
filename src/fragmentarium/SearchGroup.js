import React from 'react'
import NumberSearchForm from './search/NumberSearchForm'
import TransliterationSearchForm from './search/TransliterationSearchForm'
import LuckyButton from './LuckyButton'
import PioneersButton from './PioneersButton'

import './SearchGroup.css'

export default function SearchGroup({
  number,
  transliteration,
  fragmentSearchService
}) {
  return (
    <>
      <NumberSearchForm number={number} />
      <TransliterationSearchForm transliteration={transliteration} />
      <div className="SearchGroup__button-bar">
        <LuckyButton fragmentSearchService={fragmentSearchService} />{' '}
        <PioneersButton fragmentSearchService={fragmentSearchService} />
      </div>
    </>
  )
}
