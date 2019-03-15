import React from 'react'
import { Popover, OverlayTrigger, Button, ListGroup } from 'react-bootstrap'
import _ from 'lodash'
import HelpTrigger from 'common/HelpTrigger'

import './UncuratedReferences.css'

function UncuratedReferencesHelp () {
  return (
    <Popover id={_.uniqueId('UncuratedReferencesHelp-')}>
      <p>
        <dfn>Uncurated references</dfn> have been obtained by performing a search on a collection of PDFs.
        The names of the references are the filenames of the PDFs.
        Uncurated references should be transformed into proper bibliographical references manually.
      </p>
    </Popover>
  )
}

function UncuratedReferencesList ({ uncuratedReferences }) {
  return <Popover id={_.uniqueId('UncuratedReferencesList-')} className='UncuratedReferences__popover'>
    <ListGroup variant='flush' className='UncuratedReferences__list'>
      {uncuratedReferences.map((reference, index) =>
        <ListGroup.Item key={index}>
          {reference.document}
          {!reference.pages.isEmpty() && <>: {reference.pages.join(', ')}</>}
        </ListGroup.Item>
      )}
    </ListGroup>
  </Popover>
}

export default function UncuratedReferences ({ uncuratedReferences }) {
  return <p>
    <HelpTrigger overlay={UncuratedReferencesHelp()} />
    &nbsp;
    <OverlayTrigger
      rootClose
      overlay={UncuratedReferencesList({ uncuratedReferences })}
      trigger={['click']}
      placement='right'>
      <Button variant='outline-info' size='sm' disabled={uncuratedReferences.isEmpty()}>
        {uncuratedReferences.count()} uncurated references
      </Button>
    </OverlayTrigger>
  </p>
}
