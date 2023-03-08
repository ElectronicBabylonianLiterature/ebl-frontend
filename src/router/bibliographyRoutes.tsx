import React, { ReactNode } from 'react'
import { Route } from 'react-router-dom'
import Bibliography from 'bibliography/ui/Bibliography'
import BibliographyEditor from 'bibliography/ui/BibliographyEditor'
import BibliographyService from 'bibliography/application/BibliographyService'
import { sitemapDefaults } from 'router/sitemap'

export default function BibliographyRoutes({
  sitemap,
  bibliographyService,
}: {
  sitemap: boolean
  bibliographyService: BibliographyService
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
      {...(sitemap && sitemapDefaults)}
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
      {...(sitemap && sitemapDefaults)}
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
