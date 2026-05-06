import React, { useMemo } from 'react'
import { parse } from 'query-string'
import { useLocation } from 'react-router-dom'

import AppContent from 'common/ui/AppContent'
import SessionContext from 'auth/SessionContext'
import AboutInlineLink from 'common/ui/AboutInlineLink'
import _ from 'lodash'

import { Session } from 'auth/Session'
import SignsSearchForm from 'signs/ui/search/SignsSearchForm'
import SignsSearch from 'signs/ui/search/SignsSearch'
import SignService from 'signs/application/SignService'
import 'signs/ui/search/Signs.sass'

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
    <AppContent>
      <SessionContext.Consumer>
        {(session: Session): JSX.Element =>
          session.isAllowedToReadWords() ? (
            <>
              <div className="signs__search-header">
                <div className="signs__search-header-form">
                  <SignsSearchForm
                    sign={(query.sign as string) || undefined}
                    signQuery={query}
                    key={location.search}
                  />
                </div>
                <AboutInlineLink
                  to="/about/signs"
                  label="Signs"
                  className="signs__about-link"
                />
              </div>
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
