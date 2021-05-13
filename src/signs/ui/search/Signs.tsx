import React from 'react'
import { parse } from 'query-string'

import AppContent from 'common/AppContent'
import SessionContext from 'auth/SessionContext'

import { SectionCrumb } from 'common/Breadcrumbs'
import { Session } from 'auth/Session'
import SignsSearchForm from 'signs/ui/search/SignsSearchForm'
import SignsSearch from 'signs/ui/search/SignsSearch'
import { SignQuery } from 'signs/domain/Sign'
import _ from 'lodash'
import SignsService from 'signs/application/SignsService'
import { RouteComponentProps } from 'react-router-dom'

function parseQuery(value: string | null | string[]): string | undefined {
  if (typeof value === 'string' && value !== '') {
    return value
  } else {
    return undefined
  }
}
type Props = {
  signsService: SignsService
} & RouteComponentProps

export default function Signs({ location, signsService }: Props): JSX.Element {
  const query = parse(location.search)

  const signQuery: SignQuery = {
    value: parseQuery(query.value),
    subIndex: query.subIndex ? parseInt(query.subIndex as string) : undefined,
    listsName: parseQuery(query.listsName),
    listsNumber: parseQuery(query.listsNumber),
    isIncludeHomophones:
      parseQuery(query.isIncludeHomophones) === 'true' ? true : undefined,
    isComposite: parseQuery(query.isComposite) === 'true' ? true : undefined,
  }
  return (
    <AppContent crumbs={[new SectionCrumb('Signs')]}>
      <SessionContext.Consumer>
        {(session: Session): JSX.Element =>
          session.isAllowedToReadWords() ? (
            <>
              <SignsSearchForm
                sign={parseQuery(query.sign)}
                signQuery={signQuery}
                key={`${_.uniqueId('signs')}-${signQuery.value}`}
              />
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
