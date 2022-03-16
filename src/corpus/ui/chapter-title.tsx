import React from 'react'
import { ChapterListing, Text } from 'corpus/domain/text'
import Markup from 'transliteration/ui/markup'
import _ from 'lodash'
import { Link } from 'react-router-dom'
import { defaultName } from 'transliteration/domain/chapter-id'

export function ChapterTitle({
  chapter,
  showStage = false,
}: {
  chapter: ChapterListing
  showStage?: boolean
}): JSX.Element {
  const showName =
    chapter.name !== defaultName || (!showStage && _.isEmpty(chapter.title))
  return (
    <>
      {showStage && <>{chapter.stage} </>}
      {showName && <>{chapter.name} </>}
      <Markup container="span" parts={chapter.title} />
    </>
  )
}

export function ChapterTitleLink({
  text,
  chapter,
}: {
  text: Text
  chapter: ChapterListing
}): JSX.Element {
  return (
    <Link
      to={`/corpus/${text.genre}/${text.category}/${text.index}/${chapter.stage}/${chapter.name}`}
    >
      <ChapterTitle showStage={text.hasMultipleStages} chapter={chapter} />
    </Link>
  )
}
