import React, { Fragment } from 'react'
import { Tab, Tabs } from 'react-bootstrap'
import _ from 'lodash'

import FolioPager from './FolioPager'
import FolioImage from './FolioImage'
import CdliImage from './CdliImage'

import './Folios.css'

function Folios ({ fragment, fragmentService }) {
  function FolioDetails ({ folio }) {
    return folio.hasImage && <Fragment>
      <header className='Folios__Pager'>
        <FolioPager
          fragmentService={fragmentService}
          folio={folio}
          fragmentNumber={fragment._id} />
      </header>
      <FolioImage fragmentService={fragmentService} folio={folio} alt={folio.fileName} />
    </Fragment>
  }

  return (
    <Fragment>
      <Tabs
        id='folio-container'
        defaultActiveKey={_.findIndex(fragment.folios, 'hasImage')}>
        {fragment.folios.map((folio, index) =>
          <Tab
            key={index}
            eventKey={index}
            title={`${folio.humanizedName} Folio ${folio.number}`}
            disabled={!folio.hasImage}>
            <FolioDetails folio={folio} />
          </Tab>
        )}
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
