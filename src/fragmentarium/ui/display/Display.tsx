import React from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'
import Glossary from 'transliteration/ui/Glossary'
import { Transliteration } from 'transliteration/ui/Transliteration'
import WordService from 'dictionary/application/WordService'
import { MarkupPart } from 'transliteration/domain/markup'
import { MarkupText } from 'markup/ui/markup'

interface Props {
  fragment: Fragment
  wordService: WordService
  activeLine: string
}

function MarkupSection({
  title,
  parts,
}: {
  title: string
  parts: readonly MarkupPart[]
}) {
  return (
    <section className="CuneiformFragment__markup-section">
      <h4>{title}</h4>
      {MarkupText(parts)}
    </section>
  )
}

function Display({ fragment, wordService, activeLine }: Props): JSX.Element {
  return (
    <>
      {fragment.introduction.parts.length > 0 && (
        <MarkupSection
          title={'Introduction'}
          parts={fragment.introduction.parts}
        />
      )}
      <Transliteration text={fragment.text} activeLine={activeLine} />
      {fragment.notes.text.trim() && (
        <MarkupSection title={'eBL Notes'} parts={fragment.notes.parts} />
      )}
      <Glossary text={fragment.text} wordService={wordService} />
    </>
  )
}

export default Display
