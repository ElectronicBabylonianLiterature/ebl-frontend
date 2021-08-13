import React from 'react'
import { Text } from 'corpus/domain/text'
import { Link } from 'react-router-dom'
import Markup from 'transliteration/ui/markup'

export default function Chapters({ text }: { text: Text }): JSX.Element {
  return (
    <>
      {text.chapters.map((chapter, index) => (
        <section key={index}>
          <h4>
            <Link
              to={`/corpus/${text.genre}/${text.category}/${text.index}/${chapter.stage}/${chapter.name}`}
            >
              {chapter.name} <Markup container="span" parts={chapter.title} />
            </Link>
          </h4>
        </section>
      ))}
    </>
  )
}
