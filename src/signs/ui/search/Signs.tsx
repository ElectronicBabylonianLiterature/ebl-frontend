import React from 'react'
import { parse } from 'query-string'

import AppContent from 'common/AppContent'
import SessionContext from 'auth/SessionContext'

import { SectionCrumb } from 'common/Breadcrumbs'
import { Session } from 'auth/Session'
import { RouteComponentProps } from 'react-router-dom'
import SignsSearchForm from 'signs/ui/search/SignsSearchForm'
import './Signs.css'

export default function Signs({
  location,
  fragmentSearchService,
}): JSX.Element {
  const query = parse(location.search) || {
    query: '',
    isIncludeHomophones: false,
    isCompositeSigns: false,
  }

  return (
    <AppContent crumbs={[new SectionCrumb('Signs')]}>
      <SessionContext.Consumer>
        {(session: Session): JSX.Element =>
          session.isAllowedToReadWords() ? (
            <>
              <div className="Signs-search">
                <SignsSearchForm
                  query={query.query || ''}
                  isIncludeHomophones={query.isIncludeHomophones === 'true'}
                  isCompositeSigns={query.isCompositeSigns === 'true'}
                  fragmentSearchService={fragmentSearchService}
                />
              </div>
            </>
          ) : (
            <p>Please log in to search for Signs.</p>
          )
        }
      </SessionContext.Consumer>
    </AppContent>
  )
}
