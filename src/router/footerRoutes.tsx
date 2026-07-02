import React, { ReactNode } from 'react'
import { Route } from 'router/compat'
import { sitemapDefaults } from 'router/sitemapConfig'
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
      render={(): ReactNode => (
        <HeadTagsService title="Impressum" description="Impressum">
          <Impressum />
        </HeadTagsService>
      )}
      {...(sitemap && sitemapDefaults)}
    />,
    <Route
      key="datenschutz"
      path="/datenschutz"
      exact
      render={(): ReactNode => (
        <HeadTagsService title="Datenschutz" description="Datenschutz">
          <Datenschutz />
        </HeadTagsService>
      )}
      {...(sitemap && sitemapDefaults)}
    />,
  ]
}
