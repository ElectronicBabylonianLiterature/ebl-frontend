import React from 'react'
import queryString from 'query-string'
import { LinkContainer } from 'react-router-bootstrap'
import { Button } from 'react-bootstrap'

import Breadcrumbs from 'common/Breadcrumbs'
import BibliographySearchForm from './BibliographySearchForm'
import BibliographySearch from './BibliographySearch'
import SessionContext from 'auth/SessionContext'

import './Bibliography.css'

export default function Bibliography ({ bibliographyService, location }) {
  const query = queryString.parse(location.search).query

  return (
    <SessionContext.Consumer>
      {session =>
        <section className='App-content'>
          <header>
            <Breadcrumbs section='Bibliography' />
            <LinkContainer to='/bibliography_new'>
              <Button className='float-right' variant='outline-primary' disabled={!session.isAllowedToWriteBibliography()}>
                <i className='fas fa-plus-circle' /> Create
              </Button>
            </LinkContainer>
            <h2>Bibliography</h2>
          </header>
          {session.isAllowedToReadBibliography()
            ? <>
              <div className='Bibliography__search'><BibliographySearchForm query={query} /></div>
              <BibliographySearch query={query} bibliographyService={bibliographyService} />
            </>
            : <p>Please log in to browse the Bibliography.</p>
          }
        </section>
      }
    </SessionContext.Consumer>
  )
}
