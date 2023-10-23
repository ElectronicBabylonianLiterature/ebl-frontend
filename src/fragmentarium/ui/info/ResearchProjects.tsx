import ExternalLink from 'common/ExternalLink'
import { Fragment } from 'fragmentarium/domain/fragment'
import React from 'react'
import { ResearchProject } from 'research-projects/researchProject'

export function ProjectList({
  projects,
}: {
  projects: readonly ResearchProject[]
}): JSX.Element {
  return (
    <>
      {projects.map((project, index) => (
        <ExternalLink
          key={index}
          href={project.url}
          aria-label={`Link to ${project.name} project`}
          title={project.name}
        >
          <img
            className="ExternalResources__image"
            src={project.logo}
            alt={project.name}
          />
        </ExternalLink>
      ))}
    </>
  )
}
