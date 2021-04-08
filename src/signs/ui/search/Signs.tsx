import React from 'react'
import { parse } from 'query-string'

import AppContent from 'common/AppContent'
import SessionContext from 'auth/SessionContext'

import { SectionCrumb } from 'common/Breadcrumbs'
import { Session } from 'auth/Session'
import SignsSearchForm from 'signs/ui/search/SignsSearchForm'
import './Signs.css'
import SignsSearch from 'signs/ui/search/SignsSearch'
import { SignQuery } from 'signs/domain/Sign'

export default function Signs({ location, signsService }): JSX.Element {
  const query = parse(location.search)
  const signQuery: SignQuery = {
    value: (query.value as string) || '',
    subIndex: (query.subIndex as string) || '',
    isIncludeHomophones: query.isIncludeHomophones === 'true',
    isComposite: query.isCompositeSigns === 'true',
    signList: (query.signList as string) || '',
  }
  console.log(signQuery)

  return (
    <AppContent crumbs={[new SectionCrumb('Signs')]}>
      <SessionContext.Consumer>
        {(session: Session): JSX.Element =>
          session.isAllowedToReadWords() ? (
            <>
              <div className="Signs-search">
                <SignsSearchForm signQuery={signQuery} />
              </div>
              <SignsSearch signQuery={signQuery} signsService={signsService} />
            </>
          ) : (
            <p>Please log in to search for Signs.</p>
          )
        }
      </SessionContext.Consumer>
    </AppContent>
  )
}
