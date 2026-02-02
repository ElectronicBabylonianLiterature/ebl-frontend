import React from 'react'
import _ from 'lodash'
import { Nav } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { Text } from 'corpus/domain/text'
import { stageToAbbreviation } from 'common/period'

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
            <Nav.Link
              as={Link}
              to={`/corpus/${text.genre}/${text.category}/${
                text.index
              }/${stageToAbbreviation(chapter.stage)}/${chapter.name}`}
            >
              {chapter.stage} {chapter.name}
            </Nav.Link>
          </Nav.Item>
        ))
        .value()}
    </Nav>
  )
}
