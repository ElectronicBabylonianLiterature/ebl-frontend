import React from 'react'
import AppContent from 'common/AppContent'
import { SectionCrumb } from 'common/Breadcrumbs'
import { ResearchProject, ResearchProjects } from './researchProject'
import { Link } from 'react-router-dom'
import ListGroup from 'react-bootstrap/ListGroup'
import 'research-projects/ResearchProjects.sass'
import { Container } from 'react-bootstrap'

function ResearchProjectLink({
  project,
}: {
  project: ResearchProject
}): JSX.Element {
  return (
    <ListGroup.Item
      as={Link}
      to={`/projects/${project.abbreviation}`}
      className="d-flex align-items-center"
    >
      <img
        className="project-list__image me-3"
        src={project.logo}
        alt={project.name}
      />
      <span className="project-name">
        {project.displayName || project.name}
      </span>
    </ListGroup.Item>
  )
}

export default function ResearchProjectsOverview(): JSX.Element {
  return (
    <AppContent
      title={'Research Projects in eBL'}
      crumbs={[new SectionCrumb('Projects')]}
    >
      <Container>
        <ListGroup variant="flush" className="research-projects">
          <ResearchProjectLink project={ResearchProjects.CAIC} />
          <ResearchProjectLink project={ResearchProjects.aluGeneva} />
          <ResearchProjectLink project={ResearchProjects.AMPS} />
        </ListGroup>
      </Container>
    </AppContent>
  )
}
