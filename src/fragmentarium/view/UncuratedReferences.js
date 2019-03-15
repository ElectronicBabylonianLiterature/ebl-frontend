import React from 'react'
import { Popover } from 'react-bootstrap'
import _ from 'lodash'
import HelpTrigger from 'common/HelpTrigger'

function UncuratedReferencesteHelp () {
  return (
    <Popover id={_.uniqueId('TemplateHelp-')}>
      <p>
        <dfn>Uncurated references</dfn> have been obtained by performing a search on a collection of PDFs.
        The names of the references are the filenames of the PDFs.
        Uncurated references should be transformed into proper bibliographical references manually.
      </p>
    </Popover>
  )
}

export default function UncuratedReferences ({ uncuratedReferences }) {
  return <p><HelpTrigger overlay={UncuratedReferencesteHelp()} /> {uncuratedReferences.count()} uncurated references</p>
}
