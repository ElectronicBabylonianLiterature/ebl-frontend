import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Container, Row, Col, Card } from 'react-bootstrap'
import AppContent from 'common/AppContent'
import { TextCrumb } from 'common/Breadcrumbs'
import './tools.sass'

interface Tool {
  id: string
  title: string
  description: string
  icon: string
  path: string
  badge?: string
}

const tools: Tool[] = [
  {
    id: 'date-converter',
    title: 'Date Converter',
    description:
      'Convert between Mesopotamian calendar dates and Julian/Gregorian dates with precision',
    icon: '',
    path: '/tools/date-converter',
  },
  {
    id: 'list-of-kings',
    title: 'List of Kings',
    description:
      'Browse the comprehensive chronological list of Mesopotamian kings and rulers',
    icon: '',
    path: '/tools/list-of-kings',
  },
  {
    id: 'cuneiform-converter',
    title: 'Cuneiform Converter',
    description:
      'Convert between cuneiform signs, transliterations, and Unicode representations',
    icon: '',
    path: '/tools/cuneiform-converter',
  },
]

export default function ToolsOverview(): JSX.Element {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <AppContent title="eBL Tools" crumbs={[new TextCrumb('Tools')]}>
      <Container>
        <div className="tools-overview">
          <header className="tools-overview__header">
            <h1 className="tools-overview__title">Research Tools</h1>
            <p className="tools-overview__subtitle">
              Powerful utilities for cuneiform research and ancient Near Eastern
              studies
            </p>
          </header>

          <Row className="tools-grid">
            {tools.map((tool) => (
              <Col key={tool.id} lg={4} md={6} className="mb-4">
                <Link to={tool.path} className="tool-card-link">
                  <Card className="tool-card">
                    {tool.badge && (
                      <div className="tool-card__badge">{tool.badge}</div>
                    )}
                    <Card.Body>
                      <h3 className="tool-card__title">{tool.title}</h3>
                      <p className="tool-card__description">
                        {tool.description}
                      </p>
                      <div className="tool-card__action">
                        Open Tool <span className="tool-card__arrow">→</span>
                      </div>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </div>
      </Container>
    </AppContent>
  )
}
