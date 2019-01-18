import React, { Fragment } from 'react'

import TransliteratioForm from './TransliterationForm'
import PioneersButton from 'fragmentarium/PioneersButton'

import './Edition.css'
import TransliterationHeader from 'fragmentarium/view/TransliterationHeader'

function Edition ({ fragment, fragmentService, onChange, auth }) {
  return (
    <Fragment>
      <TransliterationHeader fragment={fragment} />
      <TransliteratioForm
        number={fragment._id}
        transliteration={fragment.atf}
        notes={fragment.notes}
        fragmentService={fragmentService}
        onChange={onChange}
        auth={auth} />
      <p className='Edition__navigation'>
        <PioneersButton auth={auth} fragmentService={fragmentService} />
      </p>
    </Fragment>
  )
}

export default Edition
