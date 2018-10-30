import React, { Fragment } from 'react'
import { Tab, Tabs } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'
import _ from 'lodash'

import FolioPager from './FolioPager'
import FolioImage from './FolioImage'
import CdliImage from './CdliImage'
import { createFragmentUrlWithFolio, createFragmentUrl } from '../FragmentLink'

import './Folios.css'

function FolioDetails ({ fragmentService, fragmentNumber, folio }) {
  return folio.hasImage && <Fragment>
    <header className='Folios__Pager'>
      <FolioPager
        fragmentService={fragmentService}
        folio={folio}
        fragmentNumber={fragmentNumber} />
    </header>
    <FolioImage fragmentService={fragmentService} folio={folio} alt={folio.fileName} />
  </Fragment>
}

function Folios ({ fragment, fragmentService, activeFolio, history }) {
  const cdliKey = -1

  function onSelect (key) {
    if (key >= 0) {
      const folio = fragment.folios[key]
      history.push(createFragmentUrlWithFolio(fragment._id, folio.name, folio.number))
    } else {
      history.push(createFragmentUrl(fragment._id))
    }
  }

  const activeKey = activeFolio
    ? _.findIndex(fragment.folios, activeFolio)
    : cdliKey

  return (
    <Fragment>
      <Tabs
        id='folio-container'
        activeKey={activeKey}
        onSelect={onSelect}>
        {fragment.folios.map((folio, index) =>
          <Tab
            key={index}
            eventKey={index}
            title={`${folio.humanizedName} Folio ${folio.number}`}
            disabled={!folio.hasImage}>
            <FolioDetails fragmentService={fragmentService} fragmentNumber={fragment._id} folio={folio} />
          </Tab>
        )}
        {fragment.cdliNumber && (
          <Tab eventKey={cdliKey} title='CDLI Image'>
            <CdliImage cdliNumber={fragment.cdliNumber} />
          </Tab>
        )}
      </Tabs>
      {_.isEmpty(fragment.folios) && _.isEmpty(fragment.cdliNumber) && 'No folios'}
    </Fragment>
  )
}

export default withRouter(Folios)
