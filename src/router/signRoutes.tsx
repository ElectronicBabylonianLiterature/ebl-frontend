import React, { ReactNode } from 'react'
import WordService from 'dictionary/application/WordService'
import { Route } from 'react-router-dom'
import SignService from 'signs/application/SignService'
import SignDisplay from 'signs/ui/display/SignDisplay'
import Signs from 'signs/ui/search/Signs'
import { SignSlugs, sitemapDefaults } from 'router/sitemap'
import { HeadTagsService } from 'router/head'
import NotFoundPage from 'NotFoundPage'

export default function SignRoutes({
  sitemap,
  wordService,
  signService,
  signSlugs,
}: {
  sitemap: boolean
  wordService: WordService
  signService: SignService
  signSlugs?: SignSlugs
}): JSX.Element[] {
  return [
    <Route
      key="signDisplay"
      path="/signs/:id"
      exact
      render={({ match }): ReactNode => (
        <HeadTagsService
          title="Cuneiform sign display: eBL"
          description="Detailed cuneiform sign information at the electronic Babylonian Library (eBL)."
        >
          <SignDisplay
            signService={signService}
            wordService={wordService}
            id={decodeURIComponent(match.params.id)}
          />
        </HeadTagsService>
      )}
      {...(sitemap && {
        ...sitemapDefaults,
        slugs: signSlugs,
      })}
    />,
    <Route
      key="signs"
      path="/signs"
      exact
      render={(props): ReactNode => (
        <HeadTagsService
          title="Cuneiform sign search: eBL"
          description="Cuneiform signs search at the electronic Babylonian Library (eBL)."
        >
          <Signs {...props} signService={signService} />
        </HeadTagsService>
      )}
      {...(sitemap && sitemapDefaults)}
    />,
    <Route
      key="SignsNotFound"
      path="/signs/*"
      render={(): ReactNode => <NotFoundPage />}
    />,
  ]
}
