import React from 'react'
import _ from 'lodash'
import { Nav } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'

export default function ChapterNavigation({ text }) {
  return (
    <Nav variant="tabs">
      {_(text.chapters)
        .sortBy((chapter) => chapter.order)
        .map((chapter, index) => (
          <Nav.Item key={index}>
            <LinkContainer
              to={`/corpus/${text.category}/${text.index}/${chapter.stage}/${chapter.name}`}
            >
              <Nav.Link>
                {chapter.stage} {chapter.name}
              </Nav.Link>
            </LinkContainer>
          </Nav.Item>
        ))
        .value()}
    </Nav>
  )
}
