import React, { ReactNode } from 'react'
import WordService from 'dictionary/application/WordService'
import { Route, Redirect } from 'router/compat'
import SignService from 'signs/application/SignService'
import { SignSlugs } from 'router/sitemap'
import NotFoundPage from 'NotFoundPage'

function withSearchAndHash(
  pathname: string,
  search: string,
  hash: string,
): string {
  return `${pathname}${search}${hash}`
}

export default function SignRoutes({
  sitemap: _sitemap,
  wordService: _wordService,
  signService: _signService,
  signSlugs: _signSlugs,
}: {
  sitemap: boolean
  wordService: WordService
  signService: SignService
  signSlugs?: SignSlugs
}): JSX.Element[] {
  return [
    <Route
      key="sign-display-redirect"
      path="/signs/:id"
      exact
      render={({ match, location }): ReactNode => (
        <Redirect
          to={withSearchAndHash(
            `/tools/signs/${match.params.id}`,
            location.search,
            location.hash,
          )}
        />
      )}
    />,
    <Route
      key="signs-redirect"
      path="/signs"
      exact
      render={({ location }): ReactNode => (
        <Redirect
          to={withSearchAndHash('/tools/signs', location.search, location.hash)}
        />
      )}
    />,
    <Route
      key="SignsNotFound"
      path="/signs/*"
      render={(): ReactNode => <NotFoundPage />}
    />,
  ]
}
