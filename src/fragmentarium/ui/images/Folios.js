// @flow
import React from 'react'
import { Tab, Tabs } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'
import _ from 'lodash'

import withData from 'http/withData'
import FolioPager from './FolioPager'
import FolioImage from './FolioImage'
import CdliImage from './CdliImage'
import Photo from './Photo'
import {
  createFragmentUrlWithFolio,
  createFragmentUrlWithTab
} from 'fragmentarium/ui/FragmentLink'

import './Folios.css'

function FolioDetails({ fragmentService, fragmentNumber, folio }) {
  return (
    folio.hasImage && (
      <>
        <header className="Folios__Pager">
          <FolioPager
            fragmentService={fragmentService}
            folio={folio}
            fragmentNumber={fragmentNumber}
          />
        </header>
        <FolioImage
          fragmentService={fragmentService}
          folio={folio}
          alt={folio.fileName}
        />
      </>
    )
  )
}

function Folios({
  fragment,
  fragmentService,
  tab,
  activeFolio,
  history,
  data
}) {
  function onSelect(key) {
    if (/\d+/.test(key)) {
      const folio = fragment.folios[key]
      history.push(
        createFragmentUrlWithFolio(fragment.number, folio.name, folio.number)
      )
    } else {
      history.push(createFragmentUrlWithTab(fragment.number, key))
    }
  }

  let activeKey =
    tab || (fragment.hasPhoto && 'photo') || (data.photoUrl && 'cdli') || '0'

  if (tab === 'folio') {
    const key = fragment.folios.findIndex(folio =>
      _.isEqual(folio, activeFolio)
    )
    if (key >= 0) {
      activeKey = String(key)
    }
  }

  return (
    <>
      <Tabs id="folio-container" activeKey={activeKey} onSelect={onSelect}>
        {fragment.hasPhoto && (
          <Tab eventKey="photo" title="Photo">
            <Photo fragment={fragment} fragmentService={fragmentService} />
          </Tab>
        )}
        {fragment.folios.map((folio, index) => (
          <Tab
            key={index}
            eventKey={index}
            title={`${folio.humanizedName} Folio ${folio.number}`}
            disabled={!folio.hasImage}
          >
            <FolioDetails
              fragmentService={fragmentService}
              fragmentNumber={fragment.number}
              folio={folio}
            />
          </Tab>
        ))}
        {data.photoUrl && (
          <Tab eventKey="cdli" title="CDLI Image">
            <CdliImage src={data.photoUrl} />
          </Tab>
        )}
      </Tabs>
      {_.isEmpty(fragment.folios) &&
        !fragment.cdliNumber &&
        !fragment.hasPhoto &&
        'No images'}
    </>
  )
}

export default withRouter(
  withData(Folios, ({ fragment, fragmentService }) =>
    fragmentService.fetchCdliInfo(fragment.cdliNumber)
  )
)
