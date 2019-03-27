import React from 'react'
import queryString from 'query-string'
import AppContent from 'common/AppContent'
import NumberSearch from 'fragmentarium/search/NumberSearch'
import TransliterationSearch from 'fragmentarium/search/TransliterationSearch'
import SessionContext from 'auth/SessionContext'
import SearchGroup from 'fragmentarium/SearchGroup'
import replaceSpecialCharacters from './replaceSpecialCharacters'

import './FragmentariumSearch.css'

function FragmentariumSearch ({ location, fragmentService }) {
  const number = queryString.parse(location.search).number
  const transliteration = queryString.parse(location.search).transliteration
  const replacedTransliteration = transliteration && replaceSpecialCharacters(transliteration)
  return (
    <AppContent section='Fragmentarium' active='Search'>
      <SessionContext.Consumer>
        {session => session.isAllowedToReadFragments()
          ? (
            <section className='Fragmentarium-search'>
              <header className='Fragmentarium-search__header'>
                <SearchGroup number={number} transliteration={replacedTransliteration} fragmentService={fragmentService} />
              </header>
              <NumberSearch number={number} fragmentService={fragmentService} />
              <TransliterationSearch transliteration={replacedTransliteration} fragmentService={fragmentService} />
            </section>
          )
          : <p>Please log in to browse the Fragmentarium.</p>
        }
      </SessionContext.Consumer>
    </AppContent>
  )
}

export default FragmentariumSearch
