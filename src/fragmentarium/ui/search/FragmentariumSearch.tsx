import React, { FunctionComponent } from 'react'
import AppContent from 'common/AppContent'
import NumberSearch from 'fragmentarium/ui/search/NumberSearch'
import TransliterationSearch from 'fragmentarium/ui/search/TransliterationSearch'
import SessionContext from 'auth/SessionContext'
import SearchGroup from 'fragmentarium/ui/SearchGroup'
import replaceTransliteration from 'fragmentarium/domain/replaceTransliteration'

import './FragmentariumSearch.css'

type Props = {
  number: string | null | undefined
  transliteration: string | null | undefined
  fragmentSearchService
}
const FragmentariumSearch: FunctionComponent<Props> = ({
  number,
  transliteration,
  fragmentSearchService
}) => {
  const replacedTransliteration =
    transliteration && replaceTransliteration(transliteration)
  return (
    <AppContent crumbs={['Fragmentarium', 'Search']}>
      <SessionContext.Consumer>
        {session =>
          session.isAllowedToReadFragments() ? (
            <section className="Fragmentarium-search">
              <header className="Fragmentarium-search__header">
                <SearchGroup
                  number={number}
                  transliteration={replacedTransliteration}
                  fragmentSearchService={fragmentSearchService}
                />
              </header>
              <NumberSearch
                number={number}
                fragmentSearchService={fragmentSearchService}
              />
              <TransliterationSearch
                transliteration={replacedTransliteration}
                fragmentSearchService={fragmentSearchService}
              />
            </section>
          ) : (
            <p>Please log in to browse the Fragmentarium.</p>
          )
        }
      </SessionContext.Consumer>
    </AppContent>
  )
}

export default FragmentariumSearch
