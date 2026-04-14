import React, { useMemo } from 'react'
import { parse } from 'query-string'
import { useLocation } from 'react-router-dom'

import AppContent from 'common/AppContent'
import WordSearchForm from './WordSearchForm'
import WordSearch from './WordSearch'
import SessionContext from 'auth/SessionContext'
import InfoBanner from 'common/InfoBanner'

import './Dictionary.css'
import { SectionCrumb } from 'common/Breadcrumbs'
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
    <AppContent crumbs={[new SectionCrumb('Dictionary')]}>
      <InfoBanner
        title="Dictionary"
        description="A flexible reference for Akkadian vocabulary with CDA and guide words."
        learnMorePath="/about/dictionary"
      />
      <SessionContext.Consumer>
        {(session: Session): JSX.Element =>
          session.isAllowedToReadWords() ? (
            <>
              <div className="Dictionary-search">
                <WordSearchForm query={query} />
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
