import React, { FunctionComponent } from 'react'
import NumberSearchForm from 'fragmentarium/ui/search/NumberSearchForm'
import TransliterationSearchForm from 'fragmentarium/ui/search/TransliterationSearchForm'
import LuckyButton from 'fragmentarium/ui/front-page/LuckyButton'
import PioneersButton from 'fragmentarium/ui/PioneersButton'

import './SearchGroup.css'

type Props = {
  number: string | null | undefined
  transliteration: string | null | undefined
  fragmentSearchService
}
const SearchGroup: FunctionComponent<Props> = ({
  number,
  transliteration,
  fragmentSearchService
}) => (
  <>
    <NumberSearchForm number={number} />
    <TransliterationSearchForm transliteration={transliteration} />
    <div className="SearchGroup__button-bar">
      <LuckyButton fragmentSearchService={fragmentSearchService} />{' '}
      <PioneersButton fragmentSearchService={fragmentSearchService} />
    </div>
  </>
)
export default SearchGroup
