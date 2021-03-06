import React from 'react'
import { parse } from 'query-string'
import { LinkContainer } from 'react-router-bootstrap'
import { Button } from 'react-bootstrap'
import _ from 'lodash'

import AppContent from 'common/AppContent'
import BibliographySearchForm from './BibliographySearchForm'
import BibliographySearch from './BibliographySearch'
import SessionContext from 'auth/SessionContext'

import './Bibliography.css'
import { SectionCrumb } from 'common/Breadcrumbs'
import { Session } from 'auth/Session'
import { RouteComponentProps } from 'react-router-dom'

function CreateButton({ session }: { session: Session }): JSX.Element {
  return (
    <LinkContainer to="/bibliography_new">
      <Button
        variant="outline-primary"
        disabled={!session.isAllowedToWriteBibliography()}
      >
        <i className="fas fa-plus-circle" /> Create
      </Button>
    </LinkContainer>
  )
}

export default function Bibliography({
  bibliographyService,
  location,
}: {
  bibliographyService
} & RouteComponentProps): JSX.Element {
  const rawQuery = parse(location.search).query || ''
  const query = _.isArray(rawQuery) ? rawQuery.join('') : rawQuery
  return (
    <SessionContext.Consumer>
      {(session: Session): JSX.Element => (
        <AppContent
          crumbs={[new SectionCrumb('Bibliography')]}
          actions={<CreateButton session={session} />}
        >
          {session.isAllowedToReadBibliography() ? (
            <>
              <div className="Bibliography__search">
                <BibliographySearchForm query={query} />
              </div>
              <BibliographySearch
                query={query}
                bibliographyService={bibliographyService}
              />
            </>
          ) : (
            <p>Please log in to browse the Bibliography.</p>
          )}
        </AppContent>
      )}
    </SessionContext.Consumer>
  )
}
