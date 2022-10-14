import React from 'react'
import Bluebird from 'bluebird'
import TransliterationForm from './TransliterationForm'
import PioneersButton from 'fragmentarium/ui/PioneersButton'

import './Edition.css'
import TransliterationHeader from 'fragmentarium/ui/fragment/TransliterationHeader'
import { Fragment } from 'fragmentarium/domain/fragment'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'

type Props = {
  fragment: Fragment
  updateTransliteration: (
    transliteration: string,
    notes: string
  ) => Bluebird<Fragment>
  fragmentSearchService: FragmentSearchService
  disabled: boolean
}

function Edition({
  fragment,
  fragmentSearchService,
  updateTransliteration,
  disabled,
}: Props): JSX.Element {
  return (
    <>
      <TransliterationHeader fragment={fragment} />
      <TransliterationForm
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

export default Edition
