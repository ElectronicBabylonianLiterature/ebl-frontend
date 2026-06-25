import React, { ReactNode } from 'react'
import { Route } from 'router/compat'
import Introduction from 'Introduction'
import type Services from 'router/Services'
import { sitemapDefaults } from 'router/sitemapConfig'

export default function IntroductionRoute(
  services: Pick<Services, 'fragmentService' | 'dossiersService'>,
  sitemap: boolean,
): JSX.Element {
  return (
    <Route
      key="Introduction"
      exact
      path="/"
      render={(): ReactNode => (
        <Introduction
          fragmentService={services.fragmentService}
          dossiersService={services.dossiersService}
        />
      )}
      {...(sitemap && sitemapDefaults)}
    />
  )
}
