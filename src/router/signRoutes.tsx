import React, { ReactNode } from 'react'
import WordService from 'dictionary/application/WordService'
import { Route, Redirect } from 'router/compat'
import SignService from 'signs/application/SignService'
import { SignSlugs } from 'router/sitemap'
import NotFoundPage from 'NotFoundPage'

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
      render={({ match }): ReactNode => (
        <Redirect to={`/tools/signs/${match.params.id}`} />
      )}
    />,
    <Redirect exact from="/signs" to="/tools/signs" key="signs-redirect" />,
    <Route
      key="SignsNotFound"
      path="/signs/*"
      render={(): ReactNode => <NotFoundPage />}
    />,
  ]
}
