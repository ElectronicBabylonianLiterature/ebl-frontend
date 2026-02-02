import React, { ReactNode } from 'react'
import { Redirect, Route } from 'router/compat'
import Bibliography from 'bibliography/ui/Bibliography'
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
            // eslint-disable-next-line react/prop-types
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
    <Route
      key="BibliographyReferencesSearch"
      path="/bibliography/references"
      exact
      render={(props): ReactNode => (
        <HeadTagsService
          title="Bibliography References: eBL"
          description="Bibliography references search in the electronic Babylonian Library (eBL)."
        >
          <Bibliography
            bibliographyService={bibliographyService}
            afoRegisterService={afoRegisterService}
            fragmentService={fragmentService}
            {...props}
            activeTab={'references'}
          />
        </HeadTagsService>
      )}
      {...(sitemap && sitemapDefaults)}
    />,
    <Route
      key="BibliographyAfoRegisterSearch"
      path="/bibliography/afo-register"
      exact
      render={(props): ReactNode => (
        <HeadTagsService
          title="Bibliography AfO-Register: eBL"
          description="AfO-Register search in the electronic Babylonian Library (eBL)."
        >
          <Bibliography
            bibliographyService={bibliographyService}
            afoRegisterService={afoRegisterService}
            fragmentService={fragmentService}
            {...props}
            activeTab={'afo-register'}
          />
        </HeadTagsService>
      )}
      {...(sitemap && sitemapDefaults)}
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
  ]
}
