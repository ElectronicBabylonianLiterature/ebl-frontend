import React, { useMemo } from 'react'
import { parse } from 'query-string'
import { useLocation } from 'react-router-dom'

import AppContent from 'common/ui/AppContent'
import WordSearchForm from './WordSearchForm'
import WordSearch from './WordSearch'
import SessionContext from 'auth/SessionContext'
import AboutInlineLink from 'common/ui/AboutInlineLink'

import './Dictionary.css'
import { Session } from 'auth/Session'
import WordService from 'dictionary/application/WordService'

export default function Dictionary({
  wordService,
}: {
  wordService: WordService
}): JSX.Element {
  const location = useLocation()
  const query = useMemo(
    () => parse(location.search, { arrayFormat: 'none' }),
    [location.search],
  )

  return (
    <AppContent>
      <SessionContext.Consumer>
        {(session: Session): JSX.Element =>
          session.isAllowedToReadWords() ? (
            <>
              <div className="Dictionary-search-header">
                <div className="Dictionary-search">
                  <WordSearchForm query={query} />
                </div>
                <AboutInlineLink
                  to="/about/akkadian-dictionary"
                  label="Akkadian Dictionary"
                  className="Dictionary-search-header__about"
                />
              </div>
              <WordSearch query={query} wordService={wordService} />
            </>
          ) : (
            <p>Please log in to browse the Dictionary.</p>
          )
        }
      </SessionContext.Consumer>
    </AppContent>
  )
}
