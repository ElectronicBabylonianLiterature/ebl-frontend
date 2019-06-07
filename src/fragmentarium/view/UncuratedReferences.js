import React from 'react'
import { Popover, OverlayTrigger, Button } from 'react-bootstrap'
import _ from 'lodash'
import HelpTrigger from 'common/HelpTrigger'
import UncuratedReferencesList from './UncuratedReferencesList'

import './UncuratedReferences.css'

function UncuratedReferencesHelp() {
  return (
    <Popover id={_.uniqueId('UncuratedReferencesHelp-')}>
      <p>
        <dfn>Uncurated references</dfn> have been obtained by performing a
        search on a collection of PDFs. The names of the references are the
        filenames of the PDFs. Uncurated references should be transformed into
        proper bibliographical references manually.
      </p>
    </Popover>
  )
}

function UncuratedReferencesPopOver({ uncuratedReferences }) {
  return (
    <Popover
      id={_.uniqueId('UncuratedReferencesList-')}
      className="UncuratedReferences__popover"
    >
      <UncuratedReferencesList
        uncuratedReferences={uncuratedReferences}
        className="UncuratedReferences__list"
      />
    </Popover>
  )
}

function createText(uncuratedReferences) {
  const count = uncuratedReferences.count()
  const text =
    count === 1 ? '1 uncurated reference' : `${count} uncurated references`
  return text
}

export default function UncuratedReferences({ uncuratedReferences }) {
  return (
    <p>
      <HelpTrigger overlay={UncuratedReferencesHelp()} />
      &nbsp;
      <OverlayTrigger
        rootClose
        overlay={UncuratedReferencesPopOver({ uncuratedReferences })}
        trigger={['click']}
        placement="right"
      >
        <Button
          variant="outline-info"
          size="sm"
          disabled={uncuratedReferences.isEmpty()}
        >
          {createText(uncuratedReferences)}
        </Button>
      </OverlayTrigger>
    </p>
  )
}
