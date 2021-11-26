import React from 'react'
import { ChapterListing, Text } from 'corpus/domain/text'
import Markup from 'transliteration/ui/markup'
import _ from 'lodash'
import { Link } from 'react-router-dom'

interface Props {
  text: Text
  chapter: ChapterListing
}

export function ChapterTitle({ text, chapter }: Props): JSX.Element {
  const showName =
    chapter.name !== '-' ||
    (!text.hasMultipleStages && _.isEmpty(chapter.title))
  return (
    <>
      {text.hasMultipleStages && <>{chapter.stage} </>}
      {showName && <>{chapter.name} </>}
      <Markup container="span" parts={chapter.title} />
    </>
  )
}

export function ChapterTitleLink({ text, chapter }: Props): JSX.Element {
  return (
    <Link
      to={`/corpus/${text.genre}/${text.category}/${text.index}/${chapter.stage}/${chapter.name}`}
    >
      <ChapterTitle text={text} chapter={chapter} />
    </Link>
  )
}
