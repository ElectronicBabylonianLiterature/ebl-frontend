import React from 'react'
import { useLocation } from 'react-router-dom'
import { Container, Row, Col } from 'react-bootstrap'
import LibrarySidebar from './LibrarySidebar'
import './Library.sass'

interface LibraryProps {
  children: React.ReactNode
}

export default function Library({ children }: LibraryProps): JSX.Element {
  const location = useLocation()

  const getActiveSection = (): string => {
    if (location.pathname.includes('/reference-library/signs')) {
      return 'signs'
    } else if (location.pathname.includes('/reference-library/dictionary')) {
      return 'dictionary'
    } else if (location.pathname.includes('/reference-library/bibliography')) {
      return 'bibliography'
    }
    return ''
  }

  return (
    <Container fluid className="Library">
      <Row>
        <Col md={2} className="Library__sidebar">
          <LibrarySidebar activeSection={getActiveSection()} />
        </Col>
        <Col md={10} className="Library__content">
          {children}
        </Col>
      </Row>
    </Container>
  )
}
