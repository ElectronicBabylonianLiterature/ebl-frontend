import React from 'react'
import { parse } from 'query-string'

import AppContent from 'common/AppContent'
import SessionContext from 'auth/SessionContext'

import { SectionCrumb } from 'common/Breadcrumbs'
import { Session } from 'auth/Session'
import SignsSearchForm from 'signs/ui/search/SignsSearchForm'
import SignsSearch from 'signs/ui/search/SignsSearch'
import _ from 'lodash'
import SignService from 'signs/application/SignService'
import { RouteComponentProps } from 'react-router-dom'

type Props = {
  signService: SignService
} & RouteComponentProps

export default function Signs({ location, signService }: Props): JSX.Element {
  const query = parse(location.search, {
    parseBooleans: true,
    parseNumbers: true,
  })

  return (
    <AppContent crumbs={[new SectionCrumb('Signs')]}>
      <SessionContext.Consumer>
        {(session: Session): JSX.Element =>
          session.isAllowedToReadWords() ? (
            <>
              <SignsSearchForm
                sign={(query.sign as string) || undefined}
                signQuery={query}
                key={`${_.uniqueId('signs')}-${query.value}`}
              />
              <SignsSearch
                signQuery={_.pickBy(
                  { ...query, sign: null },
                  (property) => _.identity(property) || property === ''
                )}
                signService={signService}
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
