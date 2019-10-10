// @flow
import React from 'react'
import { Popover, OverlayTrigger, Button } from 'react-bootstrap'
import _ from 'lodash'
import HelpTrigger from 'common/HelpTrigger'
import type { UncuratedReference } from 'fragmentarium/domain/fragment'
import UncuratedReferencesList from './UncuratedReferencesList'

import './UncuratedReferences.css'

type Props = { +uncuratedReferences: $ReadOnlyArray<UncuratedReference> }

function UncuratedReferencesHelp() {
  return (
    <Popover id={_.uniqueId('UncuratedReferencesHelp-')}>
      <Popover.Content>
        <p>
          <dfn>Uncurated references</dfn> have been obtained by performing a
          search on a collection of PDFs. The names of the references are the
          filenames of the PDFs. Uncurated references should be transformed into
          proper bibliographical references manually.
        </p>
      </Popover.Content>
    </Popover>
  )
}

function UncuratedReferencesPopOver({ uncuratedReferences }: Props) {
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

function createText(uncuratedReferences: $ReadOnlyArray<UncuratedReference>) {
  const count = uncuratedReferences.length
  return count === 1 ? '1 uncurated reference' : `${count} uncurated references`
}

export default function UncuratedReferences({ uncuratedReferences }: Props) {
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
          disabled={_.isEmpty(uncuratedReferences)}
        >
          {createText(uncuratedReferences)}
        </Button>
      </OverlayTrigger>
    </p>
  )
}
