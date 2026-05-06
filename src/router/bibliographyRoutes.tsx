import React, { ReactNode } from 'react'
import { Redirect, Route } from 'router/compat'
import BibliographyService from 'bibliography/application/BibliographyService'
import { BibliographySlugs } from 'router/sitemap'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import FragmentService from 'fragmentarium/application/FragmentService'
import NotFoundPage from 'NotFoundPage'

export default function BibliographyRoutes({
  bibliographyService: _bibliographyService,
  afoRegisterService: _afoRegisterService,
  fragmentService: _fragmentService,
  bibliographySlugs: _bibliographySlugs,
  sitemap: _sitemap,
}: {
  sitemap: boolean
  bibliographyService: BibliographyService
  afoRegisterService: AfoRegisterService
  fragmentService: FragmentService
  bibliographySlugs?: BibliographySlugs
}): JSX.Element[] {
  return [
    <Redirect
      exact
      from="/bibliography/references/new-reference"
      to="/tools/references/new-reference"
      key="bibliography-references-new-redirect"
    />,
    <Route
      key="bibliography-references-edit-redirect"
      path="/bibliography/references/:id/edit"
      exact
      render={({ match }): ReactNode => (
        <Redirect to={`/tools/references/${match.params.id}/edit`} />
      )}
    />,
    <Route
      key="bibliography-references-id-redirect"
      path="/bibliography/references/:id"
      exact
      render={({ match }): ReactNode => (
        <Redirect to={`/tools/references/${match.params.id}`} />
      )}
    />,
    <Redirect
      exact
      from="/bibliography/references"
      to="/tools/references"
      key="bibliography-references-redirect"
    />,
    <Redirect
      exact
      from="/bibliography/afo-register"
      to="/tools/afo-register"
      key="bibliography-afo-register-redirect"
    />,
    <Redirect
      exact
      from="/bibliography"
      to="/tools/references"
      key="bibliography-root-redirect"
    />,
    <Route
      key="BibliographyNotFound"
      path="/bibliography/*"
      render={(): ReactNode => <NotFoundPage />}
    />,
  ]
}
