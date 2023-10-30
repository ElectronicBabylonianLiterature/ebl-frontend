import React from 'react'
import { parse } from 'query-string'
import { LinkContainer } from 'react-router-bootstrap'
import { Button, Tab, Tabs } from 'react-bootstrap'
import _ from 'lodash'

import AppContent from 'common/AppContent'
import BibliographySearchForm from './BibliographySearchForm'
import BibliographySearch from './BibliographySearch'
import SessionContext from 'auth/SessionContext'

import './Bibliography.css'
import { TextCrumb } from 'common/Breadcrumbs'
import { Session } from 'auth/Session'
import { RouteComponentProps, useHistory } from 'react-router-dom'
import BibliographyService from 'bibliography/application/BibliographyService'

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

function BibliographyReferences({
  bibliographyService,
  location,
}: {
  bibliographyService: BibliographyService
} & RouteComponentProps): JSX.Element {
  const rawQuery = parse(location.search).query || ''
  const query = _.isArray(rawQuery) ? rawQuery.join('') : rawQuery
  return (
    <>
      <div className="Bibliography__search">
        <BibliographySearchForm query={query} />
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
  location,
  activeTab,
  ...props
}: {
  bibliographyService: BibliographyService
  activeTab: 'references' | 'afo-register'
} & RouteComponentProps): JSX.Element {
  const history = useHistory()
  return (
    <SessionContext.Consumer>
      {(session: Session): JSX.Element => (
        <AppContent
          crumbs={[
            new TextCrumb('Bibliography'),
            new TextCrumb(
              { 'afo-register': 'AfO Register', references: 'References' }[
                activeTab
              ]
            ),
          ]}
          actions={
            activeTab === 'references' && <CreateButton session={session} />
          }
        >
          {session.isAllowedToReadBibliography() ? (
            <Tabs
              activeKey={activeTab}
              onSelect={(eventKey) => {
                if (eventKey !== activeTab) {
                  history.push(`${eventKey}`)
                }
              }}
              id={_.uniqueId('Bibliography-')}
            >
              <Tab
                eventKey={'references'}
                title={'References'}
                key={'references'}
                style={{ paddingTop: '20px' }}
              >
                <BibliographyReferences
                  bibliographyService={bibliographyService}
                  location={location}
                  {...props}
                />
              </Tab>
              <Tab
                eventKey={'afo-register'}
                title={'AfO Register'}
                key={'afo-register'}
              >
                <div>AfO Register Here</div>
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
