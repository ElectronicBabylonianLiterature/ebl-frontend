import React, { ReactNode } from 'react'
import { Route } from 'react-router-dom'
import About from 'about/ui/about'
import MarkupService from 'markup/application/MarkupService'
import { sitemapDefaults } from 'router/sitemap'

export default function SignRoutes({
  sitemap,
  markupService,
}: {
  sitemap: boolean
  markupService: MarkupService
}): JSX.Element[] {
  return [
    <Route
      key="about"
      exact
      path="/about"
      render={(): ReactNode => <About markupService={markupService} />}
      {...(sitemap && sitemapDefaults)}
    />,
  ]
}
