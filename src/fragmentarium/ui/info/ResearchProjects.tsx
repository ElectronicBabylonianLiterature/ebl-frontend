import ExternalLink from 'common/ExternalLink'
import React from 'react'
import { ResearchProject } from 'research-projects/researchProject'
import './ResearchProjects.sass'

export function ProjectList({
  projects,
}: {
  projects: readonly ResearchProject[]
}): JSX.Element {
  return (
    <div className={'ResultList'}>
      {projects.map((project, index) => (
        <div key={index}>
          <ExternalLink
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
        </div>
      ))}
    </div>
  )
}
