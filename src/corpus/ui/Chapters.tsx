import React from 'react'
import { createChapterId, Text } from 'corpus/domain/text'
import CollapsibleSection from 'corpus/ui/CollapsibleSection'
import { ChapterTitleLink } from 'corpus/ui/chapter-title'

import './Chapters.sass'
import Manuscripts from 'corpus/ui/ManuscriptsTable'

export default function Chapters({
  text,
  textService,
  fragmentService,
}: {
  text: Text
  textService
  fragmentService
}): JSX.Element {
  return (
    <>
      {text.chapters.map((chapter, index) => (
        <section key={index}>
          <h4>
            <ChapterTitleLink text={text} chapter={chapter} />
          </h4>
          <CollapsibleSection
            classNameBlock="text-view"
            element="h5"
            heading="List of Manuscripts"
          >
            <Manuscripts
              id={createChapterId(text, chapter)}
              textService={textService}
              fragmentService={fragmentService}
              uncertainFragments={chapter.uncertainFragments}
            />
          </CollapsibleSection>
        </section>
      ))}
    </>
  )
}
