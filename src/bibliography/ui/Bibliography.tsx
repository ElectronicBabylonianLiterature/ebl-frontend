import React from 'react'
import { parse } from 'query-string'
import { Button, Tab, Tabs } from 'react-bootstrap'
import _ from 'lodash'
import AppContent from 'common/ui/AppContent'
import BibliographySearchForm from './BibliographySearchForm'
import BibliographySearch from './BibliographySearch'
import SessionContext from 'auth/SessionContext'
import AboutInlineLink from 'common/ui/AboutInlineLink'
import './Bibliography.css'
import { TextCrumb } from 'common/ui/Breadcrumbs'
import { Session } from 'auth/Session'
import { Link, useLocation } from 'react-router-dom'
import { useHistory } from 'router/compat'
import BibliographyService from 'bibliography/application/BibliographyService'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import AfoRegisterSearchPage from 'afo-register/ui/AfoRegisterSearchPage'
import FragmentService from 'fragmentarium/application/FragmentService'
import { referencesNewRoute } from 'bibliography/ui/referencesRouteContext'
import { BibliographyReferencesIntroduction } from 'bibliography/ui/BibliographyReferencesContent'

function CreateButton({
  session,
  pathname,
}: {
  session: Session
  pathname: string
}): JSX.Element {
  return session.isAllowedToWriteBibliography() ? (
    <Link to={referencesNewRoute(pathname)} className="btn btn-outline-primary">
      <i className="fas fa-plus-circle" /> Create
    </Link>
  ) : (
    <Button variant="outline-primary" disabled>
      <i className="fas fa-plus-circle" /> Create
    </Button>
  )
}

function getReferencesQueryFromLocation(search: string): string {
  const rawQuery = parse(search).query || ''
  return _.isArray(rawQuery) ? rawQuery.join('') : rawQuery
}

function BibliographyReferences({
  bibliographyService,
}: {
  bibliographyService: BibliographyService
}): JSX.Element {
  const location = useLocation()
  const query = getReferencesQueryFromLocation(location.search)
  return (
    <>
      <BibliographyReferencesIntroduction />
      <div className="Bibliography__search-header">
        <div className="Bibliography__search">
          <BibliographySearchForm query={query} />
        </div>
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
  )
}

export default function Bibliography({
  bibliographyService,
  afoRegisterService,
  fragmentService,
  activeTab,
  ...props
}: {
  bibliographyService: BibliographyService
  afoRegisterService: AfoRegisterService
  fragmentService: FragmentService
  activeTab: 'references' | 'afo-register'
}): JSX.Element {
  const history = useHistory()
  const location = useLocation()
  return (
    <SessionContext.Consumer>
      {(session: Session): JSX.Element => (
        <AppContent
          crumbs={[
            new TextCrumb('Bibliography'),
            new TextCrumb(
              { 'afo-register': 'AfO-Register', references: 'References' }[
                activeTab
              ],
            ),
          ]}
          actions={
            activeTab === 'references' && (
              <CreateButton session={session} pathname={location.pathname} />
            )
          }
        >
          {session.isAllowedToReadBibliography() ? (
            <Tabs
              activeKey={activeTab}
              onSelect={(eventKey) => {
                if (eventKey && eventKey !== activeTab) {
                  history.push(`/tools/${eventKey}`)
                }
              }}
              id={_.uniqueId('Bibliography-')}
            >
              <Tab
                eventKey={'afo-register'}
                title={'AfO-Register'}
                key={'afo-register'}
                style={{ paddingTop: '20px' }}
              >
                <AfoRegisterSearchPage
                  afoRegisterService={afoRegisterService}
                  fragmentService={fragmentService}
                  {...props}
                />
              </Tab>
              <Tab
                eventKey={'references'}
                title={'References'}
                key={'references'}
                style={{ paddingTop: '20px' }}
              >
                <BibliographyReferences
                  bibliographyService={bibliographyService}
                  {...props}
                />
              </Tab>
            </Tabs>
          ) : (
            <p>Please log in to browse the Bibliography.</p>
          )}
        </AppContent>
      )}
    </SessionContext.Consumer>
  )
}
