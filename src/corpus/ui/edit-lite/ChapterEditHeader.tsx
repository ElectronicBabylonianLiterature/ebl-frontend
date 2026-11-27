import React from 'react'
import { Nav } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { Text } from 'corpus/domain/text'
import { createChapterPath } from 'corpus/ui/chapterPath'

type ChapterDetail = 'classification' | 'stage' | 'version' | 'name'

const chapterDetails: readonly [ChapterDetail, string][] = [
  ['classification', 'Classification'],
  ['stage', 'Stage'],
  ['version', 'Version'],
  ['name', 'Name'],
]

function ChapterNavigation({ text }: { text: Text }): JSX.Element {
  return (
    <Nav
      variant="tabs"
      className="chapter-navigation"
      as="nav"
      aria-label="Chapters"
    >
      {text.chapters.map((chapter) => (
        <Nav.Item key={`${chapter.stage}-${chapter.name}`}>
          <Nav.Link as={Link} to={createChapterPath(text, chapter)}>
            {chapter.stage} {chapter.name}
          </Nav.Link>
        </Nav.Item>
      ))}
    </Nav>
  )
}

function ChapterDetails({ outline }: { outline: ChapterOutline }): JSX.Element {
  return (
    <dl className="chapter-details">
      {chapterDetails.map(([key, label]) => (
        <div key={key} className="chapter-details__item">
          <dt className="chapter-details__label">{label}</dt>
          <dd className="chapter-details__value">{outline[key]}</dd>
        </div>
      ))}
    </dl>
  )
}

export default function ChapterEditHeader({
  text,
  outline,
}: {
  text: Text
  outline: ChapterOutline
}): JSX.Element {
  return (
    <>
      <ChapterNavigation text={text} />
      <ChapterDetails outline={outline} />
    </>
  )
}
