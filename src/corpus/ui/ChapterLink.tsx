import React, { PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'
import { ChapterId } from 'transliteration/domain/chapter-id'
import { stageToAbbreviation } from 'corpus/domain/period'

export default function ChapterLink({
  id: { textId, stage, name },
  children,
}: PropsWithChildren<{
  id: ChapterId
}>): JSX.Element {
  return (
    <Link
      to={`/corpus/${textId.genre}/${textId.category}/${
        textId.index
      }/${stageToAbbreviation(stage)}/${name}`}
    >
      {children}
    </Link>
  )
}
