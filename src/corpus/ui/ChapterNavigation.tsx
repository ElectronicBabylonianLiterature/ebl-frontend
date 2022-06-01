import React from 'react'
import _ from 'lodash'
import { Nav } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { Text } from 'corpus/domain/text'
import { stageToAbbreviation } from 'corpus/domain/period'

export default function ChapterNavigation({
  text,
}: {
  text: Text
}): JSX.Element {
  return (
    <Nav variant="tabs">
      {_(text.chapters)
        .map((chapter, index) => (
          <Nav.Item key={index}>
            <LinkContainer
              to={`/corpus/${text.genre}/${text.category}/${
                text.index
              }/${stageToAbbreviation(chapter.stage)}/${chapter.name}`}
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
