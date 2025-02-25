import React, { PropsWithChildren } from 'react'
import AppContent from 'common/AppContent'
import { ProjectCrumb, SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import { Container, Row, Col } from 'react-bootstrap'
import { ResearchProject } from 'research-projects/researchProject'
import TableOfContents from 'research-projects/subpages/caic/TableOfContents'

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
      title={title}
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
            <TableOfContents />
          </Col>
        </Row>
      </Container>
    </AppContent>
  )
}
