import React, { ReactNode } from 'react'
import WordService from 'dictionary/application/WordService'
import { Route } from 'react-router-dom'
import SignService from 'signs/application/SignService'
import SignDisplay from 'signs/ui/display/SignDisplay'
import Signs from 'signs/ui/search/Signs'
import { SignSlugs, sitemapDefaults } from 'router/sitemap'

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
      render={(props): ReactNode => (
        <SignDisplay
          signService={signService}
          wordService={wordService}
          {...props}
        />
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
        <Signs {...props} signService={signService} />
      )}
      {...(sitemap && sitemapDefaults)}
    />,
  ]
}
