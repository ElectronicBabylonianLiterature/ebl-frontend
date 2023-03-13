import React, { ReactNode } from 'react'
import { Route } from 'react-router-dom'
import Bibliography from 'bibliography/ui/Bibliography'
import BibliographyEditor from 'bibliography/ui/BibliographyEditor'
import BibliographyService from 'bibliography/application/BibliographyService'
import { BibliographySlugs, sitemapDefaults } from 'router/sitemap'

export default function BibliographyRoutes({
  sitemap,
  bibliographyService,
  bibliographySlugs,
}: {
  sitemap: boolean
  bibliographyService: BibliographyService
  bibliographySlugs?: BibliographySlugs
}): JSX.Element[] {
  return [
    <Route
      key="BibliographyEditor"
      path="/bibliography/:id"
      render={(props): ReactNode => (
        <BibliographyEditor
          bibliographyService={bibliographyService}
          {...props}
        />
      )}
      {...(sitemap && {
        ...sitemapDefaults,
        slugs: bibliographySlugs,
      })}
    />,
    <Route
      key="BibliographyEditorNew"
      path="/bibliography_new"
      render={(props): ReactNode => (
        <BibliographyEditor
          bibliographyService={bibliographyService}
          {...props}
          create
        />
      )}
    />,
    <Route
      key="Bibliography"
      path="/bibliography"
      render={(props): ReactNode => (
        <Bibliography bibliographyService={bibliographyService} {...props} />
      )}
      {...(sitemap && sitemapDefaults)}
    />,
  ]
}
