import React from 'react'
import queryString from 'query-string'

import Breadcrumbs from 'common/Breadcrumbs'
import BibliographySearchForm from './BibliographySearchForm'
import BibliographySearch from './BibliographySearch'
import SessionContext from 'auth/SessionContext'

import './Bibliography.css'

export default function Bibliography ({ fragmentService, location }) {
  const query = queryString.parse(location.search).query

  return (
    <section className='App-content'>
      <header>
        <Breadcrumbs section='Bibliography' />
        <h2>Bibliography</h2>
      </header>
      <SessionContext.Consumer>
        {session => session.isAllowedToReadBibliography()
          ? <>
            <header className='Bibliography__header'>
              <BibliographySearchForm query={query} />
            </header>
            <BibliographySearch query={query} fragmentService={fragmentService} />
          </>
          : <p>Please log in to browse the Bibliography.</p>
        }
      </SessionContext.Consumer>
    </section>
  )
}
