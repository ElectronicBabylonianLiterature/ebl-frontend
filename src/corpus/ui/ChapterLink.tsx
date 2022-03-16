import React, { PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'
import { ChapterId } from 'transliteration/domain/chapter-id'

export default function ChapterLink({
  id: { textId, stage, name },
  children,
}: PropsWithChildren<{
  id: ChapterId
}>): JSX.Element {
  return (
    <Link
      to={`/corpus/${textId.genre}/${textId.category}/${textId.index}/${stage}/${name}`}
    >
      {children}
    </Link>
  )
}
