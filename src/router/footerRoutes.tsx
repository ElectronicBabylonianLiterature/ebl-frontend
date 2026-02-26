import React, { ReactNode } from 'react'
import { Route } from 'router/compat'
import { sitemapDefaults } from 'router/sitemap'
import { HeadTagsService } from 'router/head'
import Impressum from 'footer/ui/Impressum'
import Datenschutz from 'footer/ui/Datenschutz'

export default function FooterRoutes({
  sitemap,
}: {
  sitemap: boolean
}): JSX.Element[] {
  return [
    <Route
      key="impressum"
      path="/impressum"
      exact
      render={({ location }): ReactNode => (
        <HeadTagsService title="Impressum" description="Impressum">
          <Impressum pathname={location.pathname} />
        </HeadTagsService>
      )}
      {...(sitemap && sitemapDefaults)}
    />,
    <Route
      key="datenschutz"
      path="/datenschutz"
      exact
      render={({ location }): ReactNode => (
        <HeadTagsService title="Datenschutz" description="Datenschutz">
          <Datenschutz pathname={location.pathname} />
        </HeadTagsService>
      )}
      {...(sitemap && sitemapDefaults)}
    />,
  ]
}
