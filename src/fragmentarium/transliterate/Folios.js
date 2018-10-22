import React, { Fragment } from 'react'
import { Tab, Tabs } from 'react-bootstrap'
import _ from 'lodash'

import FolioImage from './FolioImage'
import CdliImage from './CdliImage'
import createFolio from 'fragmentarium/createFolio'

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

  const folios = fragment.folios.map(({ name, number }) => createFolio(name, number))

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
