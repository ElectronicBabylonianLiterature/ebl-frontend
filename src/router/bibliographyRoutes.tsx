import React, { ReactNode } from 'react'
import { Redirect, Route } from 'router/compat'
import type BibliographyService from 'bibliography/application/BibliographyService'
import type { BibliographySlugs } from 'router/sitemapConfig'
import type AfoRegisterService from 'afo-register/application/AfoRegisterService'
import type FragmentService from 'fragmentarium/application/FragmentService'
import NotFoundPage from 'NotFoundPage'
import withSearchAndHash from 'router/withSearchAndHash'
import {
  referencesEditRoute,
  referencesEntryRoute,
} from 'bibliography/ui/referencesRouteContext'

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
    <Route
      key="bibliography-references-new-redirect"
      path="/bibliography/references/new-reference"
      exact
      render={({ location }): ReactNode => (
        <Redirect
          to={withSearchAndHash(
            '/tools/references/new-reference',
            location.search,
            location.hash,
          )}
        />
      )}
    />,
    <Route
      key="bibliography-references-edit-redirect"
      path="/bibliography/references/:id/edit"
      exact
      render={({ match, location }): ReactNode => (
        <Redirect
          to={withSearchAndHash(
            referencesEditRoute(match.params.id ?? ''),
            location.search,
            location.hash,
          )}
        />
      )}
    />,
    <Route
      key="bibliography-references-id-redirect"
      path="/bibliography/references/:id"
      exact
      render={({ match, location }): ReactNode => (
        <Redirect
          to={withSearchAndHash(
            referencesEntryRoute(match.params.id ?? ''),
            location.search,
            location.hash,
          )}
        />
      )}
    />,
    <Route
      key="bibliography-references-redirect"
      path="/bibliography/references"
      exact
      render={({ location }): ReactNode => (
        <Redirect
          to={withSearchAndHash(
            '/tools/references',
            location.search,
            location.hash,
          )}
        />
      )}
    />,
    <Route
      key="bibliography-afo-register-redirect"
      path="/bibliography/afo-register"
      exact
      render={({ location }): ReactNode => (
        <Redirect
          to={withSearchAndHash(
            '/tools/afo-register',
            location.search,
            location.hash,
          )}
        />
      )}
    />,
    <Route
      key="bibliography-root-redirect"
      path="/bibliography"
      exact
      render={({ location }): ReactNode => (
        <Redirect
          to={withSearchAndHash(
            '/tools/references',
            location.search,
            location.hash,
          )}
        />
      )}
    />,
    <Route
      key="BibliographyNotFound"
      path="/bibliography/*"
      render={(): ReactNode => <NotFoundPage />}
    />,
  ]
}
