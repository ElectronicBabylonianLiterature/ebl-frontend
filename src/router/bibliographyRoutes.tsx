import React, { ReactNode } from 'react'
import { Redirect, Route } from 'react-router-dom'
import Bibliography from 'bibliography/ui/Bibliography'
import BibliographyEditor from 'bibliography/ui/BibliographyEditor'
import BibliographyService from 'bibliography/application/BibliographyService'
import { BibliographySlugs, sitemapDefaults } from 'router/sitemap'
import { HeadTagsService } from 'router/head'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'

export default function BibliographyRoutes({
  sitemap,
  bibliographyService,
  afoRegisterService,
  bibliographySlugs,
}: {
  sitemap: boolean
  bibliographyService: BibliographyService
  afoRegisterService: AfoRegisterService
  bibliographySlugs?: BibliographySlugs
}): JSX.Element[] {
  return [
    <Route
      key="BibliographyViewerAndEditor"
      path="/bibliography/references/:id"
      render={(props): ReactNode => (
        <HeadTagsService
          title="Bibliography entry: eBL"
          description="Bibliography entry at the electronic Library (eBL)."
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
      key="Bibliography references search"
      path="/bibliography/references"
      render={(props): ReactNode => (
        <HeadTagsService
          title="Bibliography References: eBL"
          description="Bibliography references search in the electronic Babylonian Library (eBL)."
        >
          <Bibliography
            bibliographyService={bibliographyService}
            afoRegisterService={afoRegisterService}
            {...props}
            activeTab={'references'}
          />
        </HeadTagsService>
      )}
      {...(sitemap && sitemapDefaults)}
    />,
    <Route
      key="Bibliography AfO Register search"
      path="/bibliography/afo-register"
      render={(props): ReactNode => (
        <HeadTagsService
          title="Bibliography AfO Register: eBL"
          description="AfO Register search in the electronic Babylonian Library (eBL)."
        >
          <Bibliography
            bibliographyService={bibliographyService}
            afoRegisterService={afoRegisterService}
            {...props}
            activeTab={'afo-register'}
          />
        </HeadTagsService>
      )}
      {...(sitemap && sitemapDefaults)}
    />,
    <Redirect
      from="/bibliography"
      to="/bibliography/references"
      key="bibliography-root-redirect"
      strict={true}
    />,
  ]
}
