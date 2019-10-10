import React from 'react'

import './TransliterationHeader.css'

export default function TransliterationHeader({ fragment }) {
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
