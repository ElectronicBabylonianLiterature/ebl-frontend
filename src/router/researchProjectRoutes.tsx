import React, { ReactNode } from 'react'
import { Route } from 'react-router-dom'
import { sitemapDefaults } from 'router/sitemap'
import { HeadTagsService } from 'router/head'
import { ResearchProjects } from 'research-projects/researchProject'
import CaicPage from 'projects/caic'

export default function ResearchProjectRoutes({
  sitemap,
}: {
  sitemap: boolean
}): JSX.Element[] {
  return [
    <Route
      key="caic-project"
      exact
      path={`/projects/${ResearchProjects.CAIC.abbreviation}`}
      render={(): ReactNode => (
        <HeadTagsService
          title={`${ResearchProjects.CAIC.abbreviation} in eBL`}
          description={ResearchProjects.CAIC.name}
        >
          <CaicPage />
        </HeadTagsService>
      )}
      {...(sitemap && sitemapDefaults)}
    />,
  ]
}
