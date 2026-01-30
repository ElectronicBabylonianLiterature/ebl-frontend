import React from 'react'
import { parse } from 'query-string'

import AppContent from 'common/AppContent'
import WordSearchForm from './WordSearchForm'
import WordSearch from './WordSearch'
import SessionContext from 'auth/SessionContext'
import InfoBanner from 'common/InfoBanner'

import './Dictionary.css'
import { SectionCrumb } from 'common/Breadcrumbs'
import { Session } from 'auth/Session'
import { RouteComponentProps } from 'react-router-dom'
import WordService from 'dictionary/application/WordService'

export default function Dictionary({
  wordService,
  location,
}: {
  wordService: WordService
} & RouteComponentProps): JSX.Element {
  const query = parse(location.search, { arrayFormat: 'none' })

  return (
    <AppContent crumbs={[new SectionCrumb('Dictionary')]}>
      <InfoBanner
        title="About the Dictionary"
        description="The eBL dictionary provides a flexible and dependable reference for Akkadian vocabulary, integrating several resources digitized specifically for the eBL project. It includes the full CDA (A Concise Dictionary of Akkadian) with guide words for quick lemma identification."
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
