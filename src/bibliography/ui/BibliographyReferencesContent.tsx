import React from 'react'
import { parse } from 'query-string'
import { Link, useLocation } from 'react-router-dom'
import { Button } from 'react-bootstrap'
import _ from 'lodash'
import BibliographySearchForm from 'bibliography/ui/BibliographySearchForm'
import BibliographySearch from 'bibliography/ui/BibliographySearch'
import SessionContext from 'auth/SessionContext'
import AboutInlineLink from 'common/ui/AboutInlineLink'
import { Session } from 'auth/Session'
import BibliographyService from 'bibliography/application/BibliographyService'
import { Markdown } from 'common/ui/Markdown'
import { referencesNewRoute } from 'bibliography/ui/referencesRouteContext'
import './Bibliography.css'

function getReferencesQueryFromLocation(search: string): string {
  const rawQuery = parse(search).query || ''
  return _.isArray(rawQuery) ? rawQuery.join('') : rawQuery
}

export function BibliographyReferencesIntroduction(): JSX.Element {
  return (
    <Markdown
      className="BibliographyReferences__introduction"
      text="The electronic Babylonian Library (eBL) features a comprehensive collection of
        bibliography references related to Babylonian literature and cuneiform studies in general.
        These references have been meticulously gathered and are readily accessible
        through a dedicated search function on the eBL platform.
        This robust bibliographic repository serves as a valuable resource for researchers, scholars,
        and anyone interested in the study of ancient Mesopotamian texts."
    />
  )
}

function CreateReferenceButton({
  session,
  pathname,
}: {
  session: Session
  pathname: string
}): JSX.Element {
  return session.isAllowedToWriteBibliography() ? (
    <Link
      to={referencesNewRoute(pathname)}
      className="btn btn-outline-primary Bibliography__create-link"
    >
      <i className="fas fa-plus-circle" aria-hidden="true" /> Create
    </Link>
  ) : (
    <Button
      variant="outline-primary"
      className="Bibliography__create-link"
      disabled
    >
      <i className="fas fa-plus-circle" aria-hidden="true" /> Create
    </Button>
  )
}

export default function BibliographyReferencesContent({
  bibliographyService,
}: {
  bibliographyService: BibliographyService
}): JSX.Element {
  const location = useLocation()
  const query = getReferencesQueryFromLocation(location.search)
  return (
    <SessionContext.Consumer>
      {(session: Session): JSX.Element =>
        session.isAllowedToReadBibliography() ? (
          <>
            <BibliographyReferencesIntroduction />
            <div className="Bibliography__search-header">
              <div className="Bibliography__search">
                <BibliographySearchForm query={query} />
              </div>
              <CreateReferenceButton
                session={session}
                pathname={location.pathname}
              />
              <AboutInlineLink
                to="/about/bibliography"
                label="Bibliography"
                className="Bibliography__about-link"
              />
            </div>
            <BibliographySearch
              query={query}
              bibliographyService={bibliographyService}
            />
          </>
        ) : (
          <p>Please log in to browse the Bibliography.</p>
        )
      }
    </SessionContext.Consumer>
  )
}
