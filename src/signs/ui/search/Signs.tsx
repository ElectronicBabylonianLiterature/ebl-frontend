import React, { useMemo } from 'react'
import { parse } from 'query-string'
import { useLocation } from 'react-router-dom'

import AppContent from 'common/ui/AppContent'
import SessionContext from 'auth/SessionContext'
import InfoBanner from 'common/InfoBanner'
import _ from 'lodash'

import { SectionCrumb } from 'common/ui/Breadcrumbs'
import { Session } from 'auth/Session'
import SignsSearchForm from 'signs/ui/search/SignsSearchForm'
import SignsSearch from 'signs/ui/search/SignsSearch'
import SignService from 'signs/application/SignService'

type Props = {
  signService: SignService
}

export default function Signs({ signService }: Props): JSX.Element {
  const location = useLocation()
  const query = useMemo(
    () =>
      parse(location.search, {
        parseBooleans: true,
        parseNumbers: true,
      }),
    [location.search],
  )
  const signQuery = useMemo(
    () =>
      _.pickBy(
        { ...query, sign: null },
        (property) => _.identity(property) || property === '',
      ),
    [query],
  )

  return (
    <AppContent crumbs={[new SectionCrumb('Signs')]}>
      <InfoBanner
        title="Signs"
        description="A comprehensive reference tool for cuneiform script with palaeographic resources."
        learnMorePath="/about/signs"
      />
      <SessionContext.Consumer>
        {(session: Session): JSX.Element =>
          session.isAllowedToReadWords() ? (
            <>
              <SignsSearchForm
                sign={(query.sign as string) || undefined}
                signQuery={query}
                key={location.search}
              />
              <SignsSearch signQuery={signQuery} signService={signService} />
            </>
          ) : (
            <p>Please log in to search for Signs.</p>
          )
        }
      </SessionContext.Consumer>
    </AppContent>
  )
}
