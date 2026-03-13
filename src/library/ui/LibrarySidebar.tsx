import React from 'react'
import { Nav } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import './LibrarySidebar.sass'

interface LibrarySidebarProps {
  activeSection: string
}

export default function LibrarySidebar({
  activeSection,
}: LibrarySidebarProps): JSX.Element {
  const sections = [
    {
      key: 'signs',
      title: 'Signs',
      path: '/reference-library/signs',
      description: 'Cuneiform sign search',
      icon: '𒀀',
    },
    {
      key: 'dictionary',
      title: 'Dictionary',
      path: '/reference-library/dictionary',
      description: 'Akkadian & Sumerian words',
      icon: 'Aa',
    },
    {
      key: 'bibliography',
      title: 'Bibliography',
      path: '/reference-library/bibliography',
      description: 'References & citations',
      icon: '⊞',
    },
  ]

  return (
    <div className="LibrarySidebar">
      <div className="LibrarySidebar__header">
        <h5>Reference Library</h5>
      </div>

      <Nav className="flex-column LibrarySidebar__nav">
        {sections.map((section) => (
          <Nav.Link
            key={section.key}
            as={Link}
            to={section.path}
            className={`LibrarySidebar__nav-item ${
              activeSection === section.key ? 'active' : ''
            }`}
          >
            <div className="LibrarySidebar__nav-item-icon">{section.icon}</div>
            <div className="LibrarySidebar__nav-item-content">
              <div className="LibrarySidebar__nav-item-title">
                {section.title}
              </div>
              <div className="LibrarySidebar__nav-item-description">
                {section.description}
              </div>
            </div>
          </Nav.Link>
        ))}
      </Nav>
    </div>
  )
}
