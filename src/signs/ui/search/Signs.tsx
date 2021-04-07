import React from 'react'
import { parse } from 'query-string'

import AppContent from 'common/AppContent'
import SessionContext from 'auth/SessionContext'

import { SectionCrumb } from 'common/Breadcrumbs'
import { Session } from 'auth/Session'
import SignsSearchForm from 'signs/ui/search/SignsSearchForm'
import './Signs.css'
import _ from 'lodash'
import SignsSearch from 'signs/ui/search/SignsSearch'

export default function Signs({ location, signsService }): JSX.Element {
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
                />
              </div>
              <SignsSearch
                query={
                  _.isArray(query)
                    ? (query.join('') as string)
                    : ((query as unknown) as string)
                }
                signsService={signsService}
              />
            </>
          ) : (
            <p>Please log in to search for Signs.</p>
          )
        }
      </SessionContext.Consumer>
    </AppContent>
  )
}
