import React from 'react'
import { ChapterListing, Text } from 'corpus/domain/text'
import Markup from 'transliteration/ui/markup'
import _ from 'lodash'
import { Link } from 'react-router-dom'
import { defaultName } from 'transliteration/domain/chapter-id'
import { createChapterPath } from 'corpus/ui/chapterPath'

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
    <Link to={createChapterPath(text, chapter)}>
      <ChapterTitle showStage={text.hasMultipleStages} chapter={chapter} />
    </Link>
  )
}
