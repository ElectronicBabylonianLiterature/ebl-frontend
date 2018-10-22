import React, { Fragment } from 'react'
import { Tab, Tabs } from 'react-bootstrap'
import _ from 'lodash'

import FolioImage from './FolioImage'
import CdliImage from './CdliImage'

function createFolio (data) {
  const displayNames = {
    WGL: 'Lambert',
    FWG: 'Geers',
    EL: 'Leichty',
    AKG: 'Grayson',
    MJG: 'Geller'
  }
  const foliosWithImages = ['WGL', 'AKG', 'MJG']

  return {
    humanizedName: displayNames[data.name] || data.name,
    name: data.name,
    number: data.number,
    hasImage: foliosWithImages.includes(data.name),
    fileName: `${data.name}_${data.number}.jpg`
  }
}

function Folios ({ fragment, fragmentService }) {
  function folioTab (folio, index) {
    return (
      <Tab
        key={index}
        eventKey={index}
        title={`${folio.humanizedName} Folio ${folio.number}`}
        disabled={!folio.hasImage}>
        {folio.hasImage && <Fragment>
          <FolioImage fragmentService={fragmentService} folio={folio} alt={folio.fileName} />
        </Fragment>}
      </Tab>
    )
  }

  const folios = fragment.folios.map(createFolio)

  return (
    <Fragment>
      <Tabs
        id='folio-container'
        defaultActiveKey={_.findIndex(folios, 'hasImage')}>
        {folios.map(folioTab)}
        {fragment.cdliNumber && (
          <Tab eventKey={-1} title='CDLI Image'>
            <CdliImage cdliNumber={fragment.cdliNumber} />
          </Tab>
        )}
      </Tabs>
      {_.isEmpty(fragment.folios) && _.isEmpty(fragment.cdliNumber) && 'No folios'}
    </Fragment>
  )
}

export default Folios
