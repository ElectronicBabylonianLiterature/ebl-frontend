import React from 'react'
import RandomButton from './RandomButton'

export default function PioneersButton ({auth, apiClient}) {
  return auth.isAllowedTo('transliterate:fragments') &&
    <RandomButton apiClient={apiClient} param='interesting'>Path of the Pioneers</RandomButton>
}
