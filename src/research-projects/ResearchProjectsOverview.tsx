import React from 'react'
import AppContent from 'common/AppContent'
import { SectionCrumb } from 'common/Breadcrumbs'
import { ResearchProject, ResearchProjects } from './researchProject'
import { Link } from 'react-router-dom'
import 'research-projects/ResearchProjects.sass'
import { Container, Row, Col } from 'react-bootstrap'

function ResearchProjectLink({
  project,
}: {
  project: ResearchProject
}): JSX.Element {
  return (
    <Row>
      <Col sm={2}>
        <Link to={`/projects/${project.abbreviation}`}>
          <img
            className="project-list__image"
            src={project.logo}
            alt={project.name}
          />
        </Link>
      </Col>
      <Col sm={'auto'}>
        <Link to={`/projects/${project.abbreviation}`}>
          {project.displayName || project.name}
        </Link>
      </Col>
    </Row>
  )
}

export default function ResearchProjectsOverview(): JSX.Element {
  return (
    <AppContent
      title={'Research Projects in eBL'}
      crumbs={[new SectionCrumb('Projects')]}
    >
      <section>
        <Container>
          <ResearchProjectLink project={ResearchProjects.CAIC} />
        </Container>
      </section>
    </AppContent>
  )
}
