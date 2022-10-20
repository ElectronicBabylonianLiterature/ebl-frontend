import React from 'react'
import TransliterationHeader from 'fragmentarium/ui/fragment/TransliterationHeader'
import Notes from 'fragmentarium/ui/fragment/Notes'
import { Fragment } from 'fragmentarium/domain/fragment'
import Glossary from 'transliteration/ui/Glossary'
import { Transliteration } from 'transliteration/ui/Transliteration'
import WordService from 'dictionary/application/WordService'
import Markup from 'transliteration/ui/markup'
import { MarkupPart } from 'transliteration/domain/markup'

interface Props {
  fragment: Fragment
  wordService: WordService
  activeLine: string
}

function FragmentIntroduction({ parts }: { parts: readonly MarkupPart[] }) {
  return (
    <section className="Introduction">
      <h4>Introduction</h4>
      <Markup parts={parts} />
    </section>
  )
}

function Display({ fragment, wordService, activeLine }: Props): JSX.Element {
  return (
    <>
      <TransliterationHeader fragment={fragment} />
      {fragment.notes && <Notes fragment={fragment} />}
      <Transliteration text={fragment.text} activeLine={activeLine} />
      {fragment.introduction.parts.length > 0 && (
        <FragmentIntroduction parts={fragment.introduction.parts} />
      )}
      <Glossary text={fragment.text} wordService={wordService} />
    </>
  )
}

export default Display
