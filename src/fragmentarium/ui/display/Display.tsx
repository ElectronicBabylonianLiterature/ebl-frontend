import React from 'react'
import Notes from 'fragmentarium/ui/fragment/Notes'
import { Fragment } from 'fragmentarium/domain/fragment'
import Glossary from 'transliteration/ui/Glossary'
import { Transliteration } from 'transliteration/ui/Transliteration'
import WordService from 'dictionary/application/WordService'
import Markup from 'transliteration/ui/markup'
import { MarkupPart } from 'transliteration/domain/markup'
import { isParagraphPart } from 'transliteration/domain/type-guards'
import _ from 'lodash'

interface Props {
  fragment: Fragment
  wordService: WordService
  activeLine: string
}

type ParagraphMarkupPart = MarkupPart & { paragraph: number }

function createParagraphs(
  parts: readonly MarkupPart[]
): ParagraphMarkupPart[][] {
  const paragraphs: ParagraphMarkupPart[] = []
  let current = 0

  for (const part of parts) {
    if (isParagraphPart(part)) {
      current++
    } else {
      paragraphs.push({ ...part, paragraph: current })
    }
  }

  return Object.values(_.groupBy(paragraphs, 'paragraph'))
}

function FragmentIntroduction({ parts }: { parts: readonly MarkupPart[] }) {
  return (
    <section className="Introduction">
      <h4>Introduction</h4>
      {createParagraphs(parts).map((paragraphParts, index) => (
        <Markup parts={paragraphParts} key={index} container={'p'} />
      ))}
    </section>
  )
}

function Display({ fragment, wordService, activeLine }: Props): JSX.Element {
  return (
    <>
      {fragment.introduction.parts.length > 0 && (
        <FragmentIntroduction parts={fragment.introduction.parts} />
      )}
      <Transliteration text={fragment.text} activeLine={activeLine} />
      {fragment.notes.trim() && <Notes fragment={fragment} />}
      <Glossary text={fragment.text} wordService={wordService} />
    </>
  )
}

export default Display
