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

function FragmentIntroduction({ parts }: { parts: readonly MarkupPart[] }) {
  return (
    <section className="CuneiformFragment__introduction">
      <h4>Introduction</h4>
      {MarkupText(parts)}
    </section>
  )
}

function FragmentNotes({ parts }: { parts: readonly MarkupPart[] }) {
  return (
    <section className="CuneiformFragment__notes">
      <h4>eBL Notes</h4>
      {MarkupText(parts)}
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
      {fragment.notes.text.trim() && (
        <FragmentNotes parts={fragment.notes.parts} />
      )}
      <Glossary text={fragment.text} wordService={wordService} />
    </>
  )
}

export default Display
