import React from 'react'
import RandomButton from './RandomButton'

export default function PioneersButton ({ auth, fragmentRepository }) {
  return auth.isAllowedTo('transliterate:fragments') &&
    <RandomButton
      fragmentRepository={fragmentRepository}
      method='interesting'>
        Path of the Pioneers
    </RandomButton>
}
