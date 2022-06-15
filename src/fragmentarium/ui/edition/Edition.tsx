import React from 'react'

import TransliteratioForm from './TransliterationForm'
import PioneersButton from 'fragmentarium/ui/PioneersButton'

import './Edition.css'
import TransliterationHeader from 'fragmentarium/ui/fragment/TransliterationHeader'
import { Fragment } from 'fragmentarium/domain/fragment'

type Props = {
  fragment: Fragment
  updateTransliteration
  fragmentSearchService
  disabled: boolean
}

function Edition({
  fragment,
  fragmentSearchService,
  updateTransliteration,
  disabled,
}: Props): JSX.Element {
  console.log(fragment)
  return (
    <>
      <FragmentInCorpus />
      <TransliterationHeader fragment={fragment} />
      <TransliteratioForm
        transliteration={fragment.atf}
        notes={fragment.notes}
        updateTransliteration={updateTransliteration}
        disabled={disabled}
      />
      <p className="Edition__navigation">
        <PioneersButton fragmentSearchService={fragmentSearchService} />
      </p>
    </>
  )
}
Edition.defaultProps = {
  disabled: false,
}

function FragmentInCorpus(): JSX.Element {
  return (
    <>
      <p>Edited in Corpus:</p>
    </>
  )
}

export default Edition
