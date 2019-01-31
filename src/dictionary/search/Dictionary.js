import React from 'react'
import queryString from 'query-string'

import Breadcrumbs from 'common/Breadcrumbs'
import WordSearchForm from './WordSearchForm'
import WordSearch from './WordSearch'
import SessionContext from 'auth/SessionContext'

import './Dictionary.css'

export default function Dictionary ({ wordService, location }) {
  const query = queryString.parse(location.search).query

  return (
    <section className='App-content'>
      <header>
        <Breadcrumbs section='Dictionary' />
        <h2>Dictionary</h2>
      </header>
      <SessionContext.Consumer>
        {session => session.isAllowedToReadWords()
          ? <>
            <header className='Dictionary-search'>
              <WordSearchForm query={query} />
            </header>
            <WordSearch query={query} wordService={wordService} />
          </>
          : <p>Please log in to browse the Dictionary.</p>
        }
      </SessionContext.Consumer>
    </section>
  )
}
