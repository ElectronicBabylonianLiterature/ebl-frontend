import React from 'react'
import AppContent from 'common/AppContent'
import { SectionCrumb } from 'common/Breadcrumbs'
import { ResearchProject, ResearchProjects } from './researchProject'
import { Link } from 'react-router-dom'
import { Container, Row, Col, Card } from 'react-bootstrap'
import './projects.sass'

interface ProjectCardProps {
  project: ResearchProject
}

function ProjectCard({ project }: ProjectCardProps): JSX.Element {
  return (
    <Col xs={12} md={6} lg={6} className="mb-4">
      <Link
        to={`/projects/${project.abbreviation}`}
        className="project-card-link"
      >
        <Card className="project-card h-100">
          <Card.Body className="d-flex flex-column">
            <div className="project-card__logo-container mb-3">
              <img
                src={project.logo}
                alt={project.name}
                className="project-card__logo"
              />
            </div>
            <Card.Title className="project-card__title">
              {project.displayName || project.abbreviation}
            </Card.Title>
            <Card.Text className="project-card__description flex-grow-1">
              {project.name}
            </Card.Text>
            <div className="project-card__footer">
              <span className="project-card__link-text">
                Learn more <span className="project-card__arrow">→</span>
              </span>
            </div>
          </Card.Body>
        </Card>
      </Link>
    </Col>
  )
}

export default function ProjectsOverview(): JSX.Element {
  return (
    <AppContent
      title="Research Projects"
      crumbs={[new SectionCrumb('Projects')]}
    >
      <Container className="projects-overview">
        <p className="projects-overview__intro">
          The electronic Babylonian Library (eBL) serves as a platform for
          collaborative research projects dedicated to the study of cuneiform
          texts. Explore our active research initiatives:
        </p>
        <Row>
          <ProjectCard project={ResearchProjects.CAIC} />
          <ProjectCard project={ResearchProjects.aluGeneva} />
          <ProjectCard project={ResearchProjects.AMPS} />
          <ProjectCard project={ResearchProjects.RECC} />
        </Row>
      </Container>
    </AppContent>
  )
}
