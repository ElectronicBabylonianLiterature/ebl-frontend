import React from 'react'

import './TransliterationHeader.css'
import { Fragment } from 'fragmentarium/domain/fragment';

export default function TransliterationHeader({ fragment }: { fragment: Fragment }) {
  return (
    <header>
      {fragment.description.split('\n').map((paragraph, index) => (
        <p key={index} className="TransliterationHeader__description">
          {paragraph}
        </p>
      ))}
      <p className="TransliterationHeader__publication">
        (Publication: {fragment.publication || '- '})
      </p>
    </header>
  )
}
