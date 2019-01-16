import React, { Fragment } from 'react'

import TransliteratioForm from './TransliterationForm'
import PioneersButton from 'fragmentarium/PioneersButton'

import './Edition.css'

function Edition ({ fragment, fragmentService, onChange, auth }) {
  return (
    <Fragment>
      <p className='Edition__description'>
        {fragment.description}
      </p>
      <p className='Edition__publication'>
        (Publication: {fragment.publication || '- '})
      </p>
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
