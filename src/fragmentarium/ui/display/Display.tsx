import React from 'react'
import TransliterationHeader from 'fragmentarium/ui/fragment/TransliterationHeader'
import Notes from 'fragmentarium/ui/fragment/Notes'
import { Fragment } from 'fragmentarium/domain/fragment'
import Glossary from 'transliteration/ui/Glossary'
import { Transliteration } from 'transliteration/ui/Transliteration'
import WordService from 'dictionary/application/WordService'

interface Props {
  fragment: Fragment
  wordService: WordService
}

function Display({ fragment, wordService }: Props): JSX.Element {
  return (
    <>
      <TransliterationHeader fragment={fragment} />
      {fragment.notes && <Notes fragment={fragment} />}
      <Transliteration text={fragment.text} />
      <Glossary text={fragment.text} wordService={wordService} />
    </>
  )
}

export default Display
