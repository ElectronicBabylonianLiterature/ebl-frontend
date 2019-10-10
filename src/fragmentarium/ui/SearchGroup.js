import React from 'react'
import NumberSearchForm from 'fragmentarium/ui/search/NumberSearchForm'
import TransliterationSearchForm from 'fragmentarium/ui/search/TransliterationSearchForm'
import LuckyButton from 'fragmentarium/ui/front-page/LuckyButton'
import PioneersButton from 'fragmentarium/ui/PioneersButton'

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
