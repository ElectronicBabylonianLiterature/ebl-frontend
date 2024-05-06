import ExternalLink from 'common/ExternalLink'
import React from 'react'
import { ResearchProject } from 'research-projects/researchProject'
import './ResearchProjectList.sass'

export function ProjectList({
  projects,
}: {
  projects: readonly ResearchProject[]
}): JSX.Element {
  return (
    <ul className={'ResultList'}>
      {projects.map((project, index) => (
        <li key={index}>
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
        </li>
      ))}
    </ul>
  )
}
