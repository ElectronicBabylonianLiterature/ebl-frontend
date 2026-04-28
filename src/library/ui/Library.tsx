import React from 'react'
import { useLocation } from 'react-router-dom'
import { Container, Row, Col } from 'react-bootstrap'
import LibrarySidebar from 'library/ui/LibrarySidebar'
import './Library.sass'

interface LibraryProps {
  children: React.ReactNode
}

export default function Library({ children }: LibraryProps): JSX.Element {
  const location = useLocation()

  const activeSection = location.pathname.includes('/reference-library/signs')
    ? 'signs'
    : location.pathname.includes('/reference-library/dictionary')
      ? 'dictionary'
      : location.pathname.includes('/reference-library/bibliography')
        ? 'bibliography'
        : ''

  return (
    <Container fluid className="Library">
      <Row>
        <Col xs={12} md={2} className="Library__sidebar">
          <LibrarySidebar activeSection={activeSection} />
        </Col>
        <Col xs={12} md={10} className="Library__content">
          {children}
        </Col>
      </Row>
    </Container>
  )
}
