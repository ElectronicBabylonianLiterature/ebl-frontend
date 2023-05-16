import React, { ReactNode } from 'react'
import { Route } from 'react-router-dom'
import About from 'about/ui/about'
import MarkupService from 'markup/application/MarkupService'
import { sitemapDefaults } from 'router/sitemap'
import { HeadTagsService } from 'router/head'

export default function AboutRoutes({
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
      render={(): ReactNode => (
        <HeadTagsService
          title="eBL: About"
          description="This section provides detailed information about the electronic Babylonian Library (eBL) and the materials and tools available."
        >
          <About markupService={markupService} />
        </HeadTagsService>
      )}
      {...(sitemap && sitemapDefaults)}
    />,
  ]
}
