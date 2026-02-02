import React from 'react'
import { parse } from 'query-string'
import { Button, Tab, Tabs } from 'react-bootstrap'
import _ from 'lodash'
import AppContent from 'common/AppContent'
import BibliographySearchForm from './BibliographySearchForm'
import BibliographySearch from './BibliographySearch'
import SessionContext from 'auth/SessionContext'
import './Bibliography.css'
import { TextCrumb } from 'common/Breadcrumbs'
import { Session } from 'auth/Session'
import { Link, useLocation } from 'react-router-dom'
import { useHistory } from 'router/compat'
import BibliographyService from 'bibliography/application/BibliographyService'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import AfoRegisterSearchPage from 'afo-register/ui/AfoRegisterSearchPage'
import { Markdown } from 'common/Markdown'
import FragmentService from 'fragmentarium/application/FragmentService'

function CreateButton({ session }: { session: Session }): JSX.Element {
  return session.isAllowedToWriteBibliography() ? (
    <Link
      to="/bibliography/references/new-reference"
      className="btn btn-outline-primary"
    >
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

function BibliographyReferencesIntroduction(): JSX.Element {
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
