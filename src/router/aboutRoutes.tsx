import React, { ReactNode } from 'react'
import { Redirect, Route, RouteComponentProps } from 'react-router-dom'
import About, { TabId, tabIds } from 'about/ui/about'
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
      key="about-tabs"
      exact
      path={`/about/:id(${tabIds.join('|')})`}
      render={(props: RouteComponentProps<{ id: string }>): ReactNode => (
        <HeadTagsService
          title="About: eBL"
          description="This section provides detailed information about the electronic Babylonian Library (eBL) and the materials and tools available."
        >
          <About
            markupService={markupService}
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
