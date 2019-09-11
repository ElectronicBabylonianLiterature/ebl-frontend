import React from 'react'
import AppContent from 'common/AppContent'
import NumberSearch from 'fragmentarium/search/NumberSearch'
import TransliterationSearch from 'fragmentarium/search/TransliterationSearch'
import SessionContext from 'auth/SessionContext'
import SearchGroup from 'fragmentarium/SearchGroup'
import replaceTransliteration from './replaceTransliteration'

import './FragmentariumSearch.css'

function FragmentariumSearch({
  number,
  transliteration,
  fragmentService,
  fragmentSearchService
}) {
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
