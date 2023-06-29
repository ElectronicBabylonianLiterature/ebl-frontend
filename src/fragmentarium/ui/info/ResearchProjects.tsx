import ExternalLink from 'common/ExternalLink'
import { Fragment } from 'fragmentarium/domain/fragment'
import React from 'react'

export function ProjectList({ fragment }: { fragment: Fragment }): JSX.Element {
  return (
    <>
      {fragment.projects.map((project, index) => (
        <ExternalLink
          key={index}
          href={project.url}
          aria-label={`Link to ${project.name} project`}
          title={project.name}
        >
          <img
            className="OrganizationLinks__image"
            src={project.logo}
            alt={project.name}
          />
        </ExternalLink>
      ))}
    </>
  )
}
