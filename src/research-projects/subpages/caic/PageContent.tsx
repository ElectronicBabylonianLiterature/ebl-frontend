import AppContent from 'common/AppContent'
import { TextCrumb } from 'common/Breadcrumbs'
import React, { PropsWithChildren } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { ResearchProjects } from 'research-projects/researchProject'
import TableOfContents from 'research-projects/subpages/caic/TableOfContents'

export default function PageContent({
  title,
  children,
}: { title: string } & PropsWithChildren<unknown>): JSX.Element {
  return (
    <AppContent
      title={ResearchProjects.CAIC.name}
      crumbs={[
        new TextCrumb('Projects'),
        new TextCrumb(ResearchProjects.CAIC.abbreviation),
        new TextCrumb(title),
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
