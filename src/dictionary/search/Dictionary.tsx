import React from 'react'
import queryString from 'query-string'

import AppContent from 'common/AppContent'
import WordSearchForm from './WordSearchForm'
import WordSearch from './WordSearch'
import SessionContext from 'auth/SessionContext'

import './Dictionary.css'

export default function Dictionary({ wordService, location }) {
  const query = queryString.parse(location.search).query

  return (
    <AppContent crumbs={['Dictionary']}>
      <SessionContext.Consumer>
        {session =>
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
