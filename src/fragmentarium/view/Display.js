import React, { Fragment } from 'react'

import './Display.css'
import TransliterationHeader from 'fragmentarium/view/TransliterationHeader'

function Display ({ fragment }) {
  return (
    <Fragment>
      <TransliterationHeader fragment={fragment} />
      <h4>Transliteration</h4>
      <ol className='Display__lines'>
        {fragment.atf.split('\n').map((line, index) => (
          <li key={index}>{line}</li>
        ))}
      </ol>
    </Fragment>
  )
}

export default Display
