import React, { PropsWithChildren } from 'react'
import AppContent from 'common/AppContent'
import { ProjectCrumb, SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import { Container, Row, Col, Nav } from 'react-bootstrap'
import { ResearchProject } from 'research-projects/researchProject'
import TocLink from 'research-projects/subpages/TocLink'

export default function PageContent({
  title,
  menuTitle,
  children,
  project,
}: {
  title: string
  menuTitle?: string
  project: ResearchProject
} & PropsWithChildren<unknown>): JSX.Element {
  return (
    <AppContent
      title={project.displayName || project.name}
      crumbs={[
        new SectionCrumb('Projects'),
        new ProjectCrumb(project),
        new TextCrumb(menuTitle || title),
      ]}
    >
      <Container fluid>
        <Row>
          <Col>
            <h3>{title}</h3>
          </Col>
        </Row>
        <Row>
          <Col>{children}</Col>
          <Col sm={2}>
            <Nav className={'project-page__sidebar'}>
              <TocLink project={project} path={''}>
                Home
              </TocLink>
              <TocLink project={project} path={'search'}>
                Search {project.abbreviation} Texts
              </TocLink>
            </Nav>
          </Col>
        </Row>
      </Container>
    </AppContent>
  )
}
