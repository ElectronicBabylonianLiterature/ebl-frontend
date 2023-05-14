import React, { ReactNode } from 'react'
import WordService from 'dictionary/application/WordService'
import { Route } from 'react-router-dom'
import SignService from 'signs/application/SignService'
import SignDisplay from 'signs/ui/display/SignDisplay'
import Signs from 'signs/ui/search/Signs'
import { SignSlugs, sitemapDefaults } from 'router/sitemap'
import { HeadTagsService } from 'router/head'

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
  // ToDo: Add nested `helmet` component
  return [
    <Route
      key="signDisplay"
      path="/signs/:id"
      render={({ match }): ReactNode => (
        <HeadTagsService
          title="electronic Babylonian Library: Cuneiform sign display"
          description="Detailed cuneiform sign information"
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
      render={(props): ReactNode => (
        <HeadTagsService
          title="electronic Babylonian Library: Cuneiform sign search"
          description="Cuneiform signs search"
        >
          <Signs {...props} signService={signService} />
        </HeadTagsService>
      )}
      {...(sitemap && sitemapDefaults)}
    />,
  ]
}
