import React, { ReactNode } from 'react'
import { Redirect, Route, RouteComponentProps } from 'react-router-dom'
import About, { TabId, tabIds } from 'about/ui/about'
import { CachedMarkupService } from 'markup/application/MarkupService'
import { sitemapDefaults } from 'router/sitemap'
import { HeadTagsService } from 'router/head'

// ToDo:
// - Test change of url on click at about
// - Update sitemap

export default function AboutRoutes({
  sitemap,
  cachedMarkupService,
}: {
  sitemap: boolean
  cachedMarkupService: CachedMarkupService
}): JSX.Element[] {
  return [
    <Route
      key="about-tabs"
      exact
      path={`/about/:id(${tabIds.join('|')})`}
      render={(props: RouteComponentProps<{ id: string }>): ReactNode => (
        <HeadTagsService
          title="About: eBL"
          description="This section provides detailed information about the electronic Babylonian Library (eBL) and the materials and tools available."
        >
          <About
            markupService={cachedMarkupService}
            activeTab={props.match.params.id as TabId}
          />
        </HeadTagsService>
      )}
      {...(sitemap && sitemapDefaults)}
    />,
    <Redirect
      from="/about"
      to="/about/fragmentarium"
      key="about-root-redirect"
    />,
  ]
}
