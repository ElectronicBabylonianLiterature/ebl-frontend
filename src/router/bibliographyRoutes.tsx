import React, { ReactNode } from 'react'
import { Redirect, Route } from 'react-router-dom'
import BibliographyEditor from 'bibliography/ui/BibliographyEditor'
import BibliographyViewer from 'bibliography/ui/BibliographyViewer'
import BibliographyService from 'bibliography/application/BibliographyService'
import { BibliographySlugs, sitemapDefaults } from 'router/sitemap'
import { HeadTagsService } from 'router/head'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import FragmentService from 'fragmentarium/application/FragmentService'
import NotFoundPage from 'NotFoundPage'

export default function BibliographyRoutes({
  sitemap,
  bibliographyService,
  afoRegisterService,
  fragmentService,
  bibliographySlugs,
}: {
  sitemap: boolean
  bibliographyService: BibliographyService
  afoRegisterService: AfoRegisterService
  fragmentService: FragmentService
  bibliographySlugs?: BibliographySlugs
}): JSX.Element[] {
  return [
    <Route
      key="BibliographyEditorNew"
      path="/bibliography/references/new-reference"
      exact
      render={(props): ReactNode => (
        <BibliographyEditor
          bibliographyService={bibliographyService}
          {...props}
          create={true}
          match={{
            ...props.match,
            params: { id: '' },
          }}
        />
      )}
    />,
    <Route
      key="BibliographyViewer"
      path="/bibliography/references/:id"
      exact
      render={(props): ReactNode => (
        <HeadTagsService
          title="Bibliography entry: eBL"
          description="Bibliography entry at the electronic Library (eBL)."
        >
          <BibliographyViewer
            bibliographyService={bibliographyService}
            {...props}
          />
        </HeadTagsService>
      )}
      {...(sitemap && {
        ...sitemapDefaults,
        slugs: bibliographySlugs,
      })}
    />,
    <Route
      key="BibliographyEditor"
      path="/bibliography/references/:id/edit"
      exact
      render={(props): ReactNode => (
        <HeadTagsService
          title="Edit Bibliography entry: eBL"
          description="Edit bibliography entry at the electronic Library (eBL)."
        >
          <BibliographyEditor
            bibliographyService={bibliographyService}
            {...props}
          />
        </HeadTagsService>
      )}
    />,
    <Redirect
      exact
      from="/bibliography/references"
      to="/tools/bibliography"
      key="bibliography-references-redirect"
    />,
    <Redirect
      exact
      from="/bibliography/afo-register"
      to="/tools/bibliography"
      key="bibliography-afo-redirect"
    />,
    <Redirect
      from="/bibliography"
      to="/bibliography/afo-register"
      key="bibliography-root-redirect"
    />,
    <Route
      key="BibliographyNotFound"
      path="/bibliography/*"
      render={(): ReactNode => <NotFoundPage />}
    />,
    <Redirect
      from="/bibliography"
      to="/tools/bibliography"
      key="bibliography-root-redirect"
      strict={true}
    />,
  ]
}
