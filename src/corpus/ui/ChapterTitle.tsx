import React from 'react'
import { ChapterListing, Text } from 'corpus/domain/text'
import { Link } from 'react-router-dom'
import Markup from 'transliteration/ui/markup'
import _ from 'lodash'

export default function ChapterTitle({
  text,
  chapter,
}: {
  text: Text
  chapter: ChapterListing
}): JSX.Element {
  const showStage =
    chapter.name !== '-' ||
    (!text.hasMultipleStages && _.isEmpty(chapter.title))
  return (
    <h4>
      <Link
        to={`/corpus/${text.genre}/${text.category}/${text.index}/${chapter.stage}/${chapter.name}`}
      >
        {text.hasMultipleStages && <>{chapter.stage} </>}
        {showStage && <>{chapter.name} </>}
        <Markup container="span" parts={chapter.title} />
      </Link>
    </h4>
  )
}
