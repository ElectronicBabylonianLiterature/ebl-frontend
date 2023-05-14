import React, { ReactNode } from 'react'
import { Route } from 'react-router-dom'
import Bibliography from 'bibliography/ui/Bibliography'
import BibliographyEditor from 'bibliography/ui/BibliographyEditor'
import BibliographyService from 'bibliography/application/BibliographyService'
import { BibliographySlugs, sitemapDefaults } from 'router/sitemap'
import { HeadTagsService } from 'router/head'

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
      key="BibliographyViewerAndEditor"
      path="/bibliography/:id"
      render={(props): ReactNode => (
        <HeadTagsService
          title="electronic Babylonian Library: Bibliography entry"
          description="electronic Babylonian Library: Bibliography entry"
        >
          <BibliographyEditor
            bibliographyService={bibliographyService}
            {...props}
          />{' '}
        </HeadTagsService>
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
        <HeadTagsService
          title="electronic Babylonian Library: Bibliography"
          description="Bibliography search in the electronic Babylonian Library (eBL) project."
        >
          <Bibliography bibliographyService={bibliographyService} {...props} />
        </HeadTagsService>
      )}
      {...(sitemap && sitemapDefaults)}
    />,
  ]
}
