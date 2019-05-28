import React, { Fragment } from 'react'

import TransliteratioForm from './TransliterationForm'
import PioneersButton from 'fragmentarium/PioneersButton'

import './Edition.css'
import TransliterationHeader from 'fragmentarium/view/TransliterationHeader'

function Edition ({
  fragment,
  fragmentService,
  updateTransliteration,
  disabled
}) {
  return (
    <Fragment>
      <TransliterationHeader fragment={fragment} />
      <TransliteratioForm
        transliteration={fragment.atf}
        notes={fragment.notes}
        updateTransliteration={updateTransliteration}
        disable={disabled}
      />
      <p className='Edition__navigation'>
        <PioneersButton fragmentService={fragmentService} />
      </p>
    </Fragment>
  )
}

export default Edition
