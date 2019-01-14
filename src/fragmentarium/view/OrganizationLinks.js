import React from 'react'

import CdliLink from './CdliLink'
import ExternalLink from 'common/ExternalLink'

import './OrganizationLinks.css'
import cdliLogo from './cdli.png'
import bmLogo from './The_British_Museum.png'

export default function OrganizationLinks ({ cdliNumber, bmIdNumber }) {
  return (
    <p className='OrganizationLinks'>
      {bmIdNumber && (
        <ExternalLink alt='The British Museum'
          href={`https://www.britishmuseum.org/research/collection_online/collection_object_details.aspx?objectId=${bmIdNumber}&partId=1`}
          aria-label={`The British Museum object ${bmIdNumber}`}>
          <img className='OrganizationLinks__image' src={bmLogo} alt='The British Museum' />
        </ExternalLink>
      )}
      {cdliNumber && (
        <CdliLink cdliNumber={cdliNumber}>
          <img className='OrganizationLinks__image' src={cdliLogo} alt='cdli' />
        </CdliLink>
      )}
    </p>
  )
}
