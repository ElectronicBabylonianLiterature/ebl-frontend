import AppContent from 'common/AppContent'
import { TextCrumb } from 'common/Breadcrumbs'
import React from 'react'
import { ResearchProject, ResearchProjects } from './researchProject'
import { Link } from 'react-router-dom'

function ResearchProjectLink({
  project,
}: {
  project: ResearchProject
}): JSX.Element {
  return <Link to={`/projects/${project.abbreviation}`}>{project.name}</Link>
}

export default function ResearchProjectsOverview(): JSX.Element {
  return (
    <AppContent
      title={'Research Projects in eBL'}
      crumbs={[new TextCrumb('Projects')]}
    >
      <section>
        <ul>
          <li>
            <ResearchProjectLink project={ResearchProjects.CAIC} />
          </li>
        </ul>
      </section>
    </AppContent>
  )
}
