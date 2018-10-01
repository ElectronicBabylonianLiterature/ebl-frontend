import React from 'react'
import RandomButton from './RandomButton'

export default function PioneersButton ({ fragmentService }) {
  return fragmentService.isAllowedToTransliterate() &&
    <RandomButton
      fragmentService={fragmentService}
      method='interesting'>
        Path of the Pioneers
    </RandomButton>
}
