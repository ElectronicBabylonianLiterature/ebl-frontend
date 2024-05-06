import React, { PropsWithChildren } from 'react'
import AppContent from 'common/AppContent'
import { ProjectCrumb, SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import { Container, Row, Col } from 'react-bootstrap'
import { ResearchProjects } from 'research-projects/researchProject'
import TableOfContents from 'research-projects/subpages/caic/TableOfContents'

export default function PageContent({
  title,
  menuTitle,
  children,
}: { title: string; menuTitle?: string } & PropsWithChildren<
  unknown
>): JSX.Element {
  return (
    <AppContent
      title={ResearchProjects.CAIC.name}
      crumbs={[
        new SectionCrumb('Projects'),
        new ProjectCrumb(ResearchProjects.CAIC),
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
